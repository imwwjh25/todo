package com.todo.dto.response;

import lombok.Data;

@Data
public class PriorityStatistics {
    private Integer priority;
    private String priorityName;
    private Long totalCount;
    private Long completedCount;
    private Double completionRate;
    private Long overdueCount;
}