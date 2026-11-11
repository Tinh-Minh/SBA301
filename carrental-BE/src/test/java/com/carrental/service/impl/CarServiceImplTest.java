package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.FuelType;
import com.carrental.enums.KycStatus;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.Role;
import com.carrental.enums.Transmission;
import com.carrental.exception.AppException;
import com.carrental.repository.CarDocumentRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.service.CurrentUserService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

class CarServiceImplTest {

    private final CarRepository carRepository = mock(CarRepository.class);
    private final CarImageRepository carImageRepository = mock(CarImageRepository.class);
    private final CarDocumentRepository carDocumentRepository = mock(CarDocumentRepository.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private final CarServiceImpl service = new CarServiceImpl(
            carRepository, carImageRepository, carDocumentRepository, currentUserService);

    @Test
    void ownerCannotSelfApprovePendingCarOrTouchRejectedCar() {
        Customer owner = verifiedOwner();
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(currentUserService.isOwner(any(Car.class), any(Customer.class))).thenReturn(true);

        for (CarStatus initial : List.of(CarStatus.PENDING_APPROVAL, CarStatus.REJECTED)) {
            for (CarStatus requested : List.of(CarStatus.ACTIVE, CarStatus.INACTIVE)) {
                Car car = carWithStatus(10L, owner, initial);
                when(carRepository.findById(10L)).thenReturn(Optional.of(car));

                assertThatThrownBy(() -> service.updateCarStatusByOwner(10L, requested))
                        .isInstanceOf(AppException.class)
                        .extracting(ex -> ((AppException) ex).getStatus())
                        .isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(car.getStatus()).isEqualTo(initial);
            }
        }
        verify(carRepository, never()).saveAndFlush(any(Car.class));
    }

    @Test
    void ownerCanToggleApprovedCarBetweenActiveAndInactive() {
        Customer owner = verifiedOwner();
        Car car = carWithStatus(11L, owner, CarStatus.ACTIVE);
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(currentUserService.isOwner(car, owner)).thenReturn(true);
        when(carRepository.findById(11L)).thenReturn(Optional.of(car));
        when(carRepository.saveAndFlush(car)).thenReturn(car);
        when(carImageRepository.findAllByCarIdOrderBySortOrderAsc(11L)).thenReturn(List.of());
        when(carDocumentRepository.findAllByCarId(11L)).thenReturn(List.of());

        var paused = service.updateCarStatusByOwner(11L, CarStatus.INACTIVE);
        assertThat(paused.status()).isEqualTo(CarStatus.INACTIVE);

        var resumed = service.updateCarStatusByOwner(11L, CarStatus.ACTIVE);
        assertThat(resumed.status()).isEqualTo(CarStatus.ACTIVE);
    }

    @Test
    void adminCanStillApprovePendingCar() {
        Customer owner = verifiedOwner();
        Car car = carWithStatus(12L, owner, CarStatus.PENDING_APPROVAL);
        when(carRepository.findById(12L)).thenReturn(Optional.of(car));
        when(carRepository.saveAndFlush(car)).thenReturn(car);
        when(carImageRepository.findAllByCarIdOrderBySortOrderAsc(12L)).thenReturn(List.of());
        when(carDocumentRepository.findAllByCarId(12L)).thenReturn(List.of());

        var approved = service.approveCar(12L);
        assertThat(approved.status()).isEqualTo(CarStatus.ACTIVE);
    }

    private static Customer verifiedOwner() {
        Customer owner = Customer.builder()
                .fullName("Trần Thị Bình")
                .email("binh@gmail.com")
                .phone("0912345678")
                .passwordHash("hash")
                .role(Role.OWNER)
                .kycStatus(KycStatus.VERIFIED)
                .status(CustomerStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(owner, "id", 3L);
        return owner;
    }

    private static Car carWithStatus(Long id, Customer owner, CarStatus status) {
        Car car = Car.builder()
                .owner(owner)
                .licensePlate("51K-12345")
                .brand("Honda")
                .model("City RS")
                .manufactureYear(2023)
                .carType(CarType.SEDAN)
                .seats(5)
                .transmission(Transmission.AUTOMATIC)
                .fuelType(FuelType.GASOLINE)
                .city("TP. Hồ Chí Minh")
                .pickupAddress("123 Nguyễn Thị Thập")
                .rentalPricePerDay(BigDecimal.valueOf(700000))
                .status(status)
                .listingStatus(ListingStatus.UNLISTED)
                .build();
        ReflectionTestUtils.setField(car, "id", id);
        return car;
    }
}

