package com.carrental.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.carrental.controller.UploadController;
import com.carrental.dto.response.CarImageResponse;
import com.carrental.entity.Car;
import com.carrental.entity.CarImage;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.GlobalExceptionHandler;
import com.carrental.repository.CarDocumentRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.service.impl.CarServiceImpl;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class CarImageUploadTest {

    @TempDir
    Path tempDir;

    @Test
    void uploadAndLoadValidPngJpgAndWebpSucceeds() throws Exception {
        PublicImageStorageService storage = new PublicImageStorageService(tempDir.toString());
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new UploadController(storage))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        byte[] pngBytes = createImageBytes("png");
        byte[] jpgBytes = createImageBytes("jpg");
        byte[] webpBytes = minimalValidWebpHeader();

        MvcResult pngRes = mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "front.png", "image/png", pngBytes)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.url").isString())
                .andReturn();

        String body = pngRes.getResponse().getContentAsString();
        String url = body.replaceAll(".*\"url\":\"([^\"]+)\".*", "$1");
        mvc.perform(get(url))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));

        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "side.jpg", "image/jpeg", jpgBytes)))
                .andExpect(status().isOk());

        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "back.webp", "image/webp", webpBytes)))
                .andExpect(status().isOk());

        byte[] vp8l = minimalValidWebpHeader("WEBPVP8L");
        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "lossless.webp", "image/webp", vp8l)))
                .andExpect(status().isOk());
    }

    @Test
    void oversizedAndInvalidFormatFilesAreRejectedWithExpectedStatus() throws Exception {
        PublicImageStorageService storage = new PublicImageStorageService(tempDir.toString());
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new UploadController(storage))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        byte[] tooLarge = new byte[(int) PublicImageStorageService.MAX_IMAGE_BYTES + 1];
        tooLarge[0] = (byte) 0x89;
        tooLarge[1] = 'P';
        tooLarge[2] = 'N';
        tooLarge[3] = 'G';
        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "huge.png", "image/png", tooLarge)))
                .andExpect(status().isPayloadTooLarge());

        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "notes.txt", "text/plain", createImageBytes("png"))))
                .andExpect(status().isUnsupportedMediaType());

        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "fake.jpg", "image/jpeg", "not-an-image".getBytes(StandardCharsets.UTF_8))))
                .andExpect(status().isUnsupportedMediaType());

        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "fake.webp", "image/webp", "RIFF1234WEBP".getBytes(StandardCharsets.US_ASCII))))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    void batchUploadCleansUpStoredFilesIfAnyFileFails() throws Exception {
        PublicImageStorageService storage = new PublicImageStorageService(tempDir.toString());
        MockMultipartFile good = new MockMultipartFile("files", "car1.png", "image/png", createImageBytes("png"));
        MockMultipartFile bad = new MockMultipartFile("files", "car2.gif", "image/gif", "GIF89a".getBytes(StandardCharsets.US_ASCII));

        assertThatThrownBy(() -> storage.storeImages(List.of(good, bad)))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).getStatus())
                .isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);

        assertThat(Files.exists(tempDir) ? Files.list(tempDir).count() : 0L).isZero();
    }

    @Test
    void carServiceMultipartUploadPersistsImagesAndRollsBackFilesOnDbFailure() throws Exception {
        PublicImageStorageService storage = new PublicImageStorageService(tempDir.toString());
        CarRepository carRepository = mock(CarRepository.class);
        CarImageRepository carImageRepository = mock(CarImageRepository.class);
        CarDocumentRepository carDocumentRepository = mock(CarDocumentRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);

        Customer owner = Customer.builder()
                .role(Role.OWNER)
                .status(CustomerStatus.ACTIVE)
                .kycStatus(KycStatus.VERIFIED)
                .build();
        ReflectionTestUtils.setField(owner, "id", 7L);
        Car car = Car.builder().owner(owner).build();
        ReflectionTestUtils.setField(car, "id", 99L);
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(currentUserService.isOwner(car, owner)).thenReturn(true);
        when(carRepository.findById(99L)).thenReturn(Optional.of(car));
        when(carImageRepository.countByCarId(99L)).thenReturn(0L);
        when(carImageRepository.saveAllAndFlush(anyList())).thenAnswer(inv -> {
            List<CarImage> list = inv.getArgument(0);
            for (int i = 0; i < list.size(); i++) {
                ReflectionTestUtils.setField(list.get(i), "id", 100L + i);
            }
            return list;
        });

        CarServiceImpl carService = new CarServiceImpl(
                carRepository, carImageRepository, carDocumentRepository, currentUserService, storage);

        MockMultipartFile f1 = new MockMultipartFile("files", "front.png", "image/png", createImageBytes("png"));
        MockMultipartFile f2 = new MockMultipartFile("files", "side.jpg", "image/jpeg", createImageBytes("jpg"));

        List<CarImageResponse> saved = carService.addCarImages(99L, List.of(f1, f2), 1);
        assertThat(saved).hasSize(2);
        assertThat(saved.get(0).isPrimary()).isFalse();
        assertThat(saved.get(1).isPrimary()).isTrue();
        assertThat(saved.get(0).imageUrl()).startsWith("/api/uploads/files/");
        assertThat(Files.list(tempDir).count()).isEqualTo(2L);

        when(carImageRepository.saveAllAndFlush(anyList()))
                .thenThrow(new DataIntegrityViolationException("boom"));
        assertThatThrownBy(() -> carService.addCarImages(99L, List.of(f1), null))
                .isInstanceOf(AppException.class);
        assertThat(Files.list(tempDir).count()).isEqualTo(2L);
    }

    private static byte[] createImageBytes(String format) throws Exception {
        BufferedImage img = new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, format, out);
        return out.toByteArray();
    }

    private static byte[] minimalValidWebpHeader() {
        return minimalValidWebpHeader("WEBPVP8 ");
    }

    private static byte[] minimalValidWebpHeader(String fourCcPlusChunk) {
        byte[] bytes = new byte[24];
        byte[] riff = "RIFF".getBytes(StandardCharsets.US_ASCII);
        byte[] webp = fourCcPlusChunk.getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(riff, 0, bytes, 0, 4);
        System.arraycopy(webp, 0, bytes, 8, 8);
        return bytes;
    }
}
