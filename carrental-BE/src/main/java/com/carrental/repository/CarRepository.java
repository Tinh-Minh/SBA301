package com.carrental.repository;

import com.carrental.entity.Car;
import com.carrental.enums.CarStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car> {

    Optional<Car> findByLicensePlate(String licensePlate);

    boolean existsByLicensePlateIgnoreCase(String licensePlate);

    boolean existsByLicensePlateIgnoreCaseAndIdNot(String licensePlate, Long id);

    /**
     * So sánh biển số sau khi chuẩn hoá (bỏ '-', '.', khoảng trắng, viết hoa) để
     * "51Q-719.80" và "51q71980" được coi là cùng một xe.
     */
    @org.springframework.data.jpa.repository.Query("select count(c) > 0 from Car c where "
            + "upper(replace(replace(replace(c.licensePlate, '-', ''), '.', ''), ' ', '')) = :normalized")
    boolean existsByNormalizedLicensePlate(
            @org.springframework.data.repository.query.Param("normalized") String normalized);

    Page<Car> findAllByOwnerId(Long ownerId, Pageable pageable);

    Page<Car> findAllByOwnerIdAndStatus(Long ownerId, CarStatus status, Pageable pageable);

    Page<Car> findAllByStatus(CarStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"owner"})
    Optional<Car> findWithOwnerById(Long id);

    /** Khoá dòng xe để tuần tự hoá các thao tác đặt lịch trên cùng một xe. */
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select c from Car c where c.id = :id")
    Optional<Car> findWithLockById(@org.springframework.data.repository.query.Param("id") Long id);

    java.util.List<Car> findAllByOwnerIdOrderByIdAsc(Long ownerId);

    long countByListingStatus(com.carrental.enums.ListingStatus listingStatus);
}
