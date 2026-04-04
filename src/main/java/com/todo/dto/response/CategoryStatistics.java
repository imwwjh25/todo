package com.todo.dto.response;

import lombok.Data;

@Data
public class CategoryStatistics {
    private Long categoryId;
    private String categoryName;
    private Long totalCount;
    private Long completedCount;
    private Double completionRate;
}