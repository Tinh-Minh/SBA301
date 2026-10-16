package com.carrental.entity.base;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

/** Base entity for tables whose updated_at value is maintained by PostgreSQL. */
@MappedSuperclass
public abstract class AuditedEntity extends BaseEntity {

    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
