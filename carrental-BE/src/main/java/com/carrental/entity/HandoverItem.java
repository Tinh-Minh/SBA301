package com.carrental.entity;

import com.carrental.enums.HandoverCategory;
import com.carrental.enums.HandoverItemStatus;
import jakarta.persistence.*;
import lombok.*;

/** Một hạng mục trong biên bản: ảnh hiện trạng + mô tả; khách đồng ý hoặc yêu cầu sửa. */
@Entity
@Table(name = "handover_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HandoverItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handover_id", nullable = false)
    private Handover handover;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private HandoverCategory category;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    @Column(name = "condition_note", length = 1000)
    private String conditionNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private HandoverItemStatus status = HandoverItemStatus.PENDING;

    /** Khách ghi rõ cần sửa gì (ảnh mờ, thiếu vết xước, sai số km...). */
    @Column(name = "dispute_note", length = 1000)
    private String disputeNote;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
