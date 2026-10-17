package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.carrental.config.DocumentProperties;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.UserDocumentSubmissionRequest;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.UserDocumentType;
import com.carrental.entity.UserDocument;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.CustomerStatusLock;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.impl.UserDocumentServiceImpl;
import com.carrental.service.DocumentReviewLogger;
import com.carrental.service.KycService;
import com.carrental.storage.DocumentImageInspector;
import com.carrental.storage.LocalPrivateDocumentStorage;
import com.carrental.storage.UploadedDocumentImage;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.LoggerFactory;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

class UserDocumentTransactionOutcomeTest {

    @Test
    void unknownAtCommitBoundaryKeepsActualReceiptAndWritesSafeRecoveryLog(@TempDir Path root) throws Exception {
        verifyCommitBoundary(root, TransactionSynchronization.STATUS_UNKNOWN, true, "outcome unknown");
    }

    @Test
    void exceptionAfterConfirmedCommitDoesNotDeleteReferencedFile(@TempDir Path root) throws Exception {
        verifyCommitBoundary(root, TransactionSynchronization.STATUS_COMMITTED, true, "failure after committed transaction");
    }

    private void verifyCommitBoundary(Path root, int completionStatus, boolean failCommit, String safeLogPhrase)
            throws Exception {
        DocumentProperties properties = new DocumentProperties();
        properties.getStorage().setEnabled(true);
        properties.getStorage().setRoot(root.toString());
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(properties);
        Customer owner = new Customer();
        ReflectionTestUtils.setField(owner, "id", 907L);
        owner.setStatus(CustomerStatus.ACTIVE);
        owner.setRole(Role.CUSTOMER);

        CustomerRepository customers = mock(CustomerRepository.class);
        when(customers.findByIdForUpdate(907L)).thenReturn(Optional.of(owner));
        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        when(documents.saveAndFlush(any(UserDocument.class))).thenAnswer(invocation -> {
            UserDocument document = invocation.getArgument(0);
            ReflectionTestUtils.setField(document, "id", 1907L);
            return document;
        });
        PlatformTransactionManager transactions = new CompletionTransactionManager(completionStatus, failCommit);
        UserDocumentServiceImpl service = new UserDocumentServiceImpl(customers, documents, storage,
                new DocumentImageInspector(properties), transactions, mock(CustomerStatusLock.class),
                mock(KycService.class), mock(DocumentReviewLogger.class), Clock.systemDefaultZone());
        UserDocumentSubmissionRequest metadata = new UserDocumentSubmissionRequest(UserDocumentType.CITIZEN_ID,
                "SYNTHETIC-" + UUID.randomUUID().toString().substring(0, 8), null, LocalDate.of(2000, 1, 1),
                null, null, null, null);
        UserDocumentSubmissionCommand command = new UserDocumentSubmissionCommand(metadata,
                new UploadedDocumentImage("front.png", "image/png", png()), null);
        CurrentAccount principal = new CurrentAccount(907L, Role.CUSTOMER);

        try (SafeLogCapture logs = new SafeLogCapture()) {
            assertThatThrownBy(() -> service.submit(principal, command)).isInstanceOf(TransactionSystemException.class)
                    .hasMessage("SENTINEL_TRANSACTION_COMPLETION");
            assertThat(fileCount(root)).isEqualTo(1);
            String rendered = logs.rendered();
            assertThat(rendered).contains(safeLogPhrase, "receiptIds=")
                    .doesNotContain(root.toString(), "SYNTHETIC-", "SENTINEL_TRANSACTION_COMPLETION", "private-local:");
            assertThat(logs.events()).allSatisfy(event -> assertThat(event.getThrowableProxy()).isNull());
        }
    }

    private static byte[] png() throws Exception {
        BufferedImage image = new BufferedImage(8, 5, BufferedImage.TYPE_INT_RGB);
        image.setRGB(3, 2, 0x6432a0);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        assertThat(ImageIO.write(image, "png", output)).isTrue();
        return output.toByteArray();
    }

    private static long fileCount(Path root) throws Exception {
        try (var files = Files.list(root)) { return files.count(); }
    }

    private static final class CompletionTransactionManager implements PlatformTransactionManager {
        private final int completionStatus;
        private final boolean failCommit;

        private CompletionTransactionManager(int completionStatus, boolean failCommit) {
            this.completionStatus = completionStatus;
            this.failCommit = failCommit;
        }

        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            TransactionSynchronizationManager.initSynchronization();
            TransactionSynchronizationManager.setActualTransactionActive(true);
            return new SimpleTransactionStatus(true);
        }

        @Override
        public void commit(TransactionStatus status) {
            complete(completionStatus);
            if (failCommit) throw new TransactionSystemException("SENTINEL_TRANSACTION_COMPLETION");
        }

        @Override
        public void rollback(TransactionStatus status) {
            complete(TransactionSynchronization.STATUS_ROLLED_BACK);
        }

        private void complete(int status) {
            try {
                List<TransactionSynchronization> synchronizations =
                        new ArrayList<>(TransactionSynchronizationManager.getSynchronizations());
                for (TransactionSynchronization synchronization : synchronizations) {
                    synchronization.afterCompletion(status);
                }
            } finally {
                TransactionSynchronizationManager.clearSynchronization();
                TransactionSynchronizationManager.setActualTransactionActive(false);
            }
        }
    }

    private static final class SafeLogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger logger;
        private final List<ILoggingEvent> events = new ArrayList<>();

        private SafeLogCapture() {
            LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
            setContext(context);
            setName("p05-transaction-outcome-" + UUID.randomUUID());
            logger = context.getLogger(UserDocumentServiceImpl.class);
            start();
            logger.addAppender(this);
        }

        @Override protected void append(ILoggingEvent event) {
            event.prepareForDeferredProcessing();
            events.add(event);
        }

        private List<ILoggingEvent> events() { return List.copyOf(events); }

        private String rendered() {
            StringBuilder output = new StringBuilder();
            for (ILoggingEvent event : events) output.append(event.getFormattedMessage()).append(' ').append(event.getMDCPropertyMap());
            return output.toString();
        }

        @Override public void close() {
            logger.detachAppender(this);
            stop();
        }
    }
}
