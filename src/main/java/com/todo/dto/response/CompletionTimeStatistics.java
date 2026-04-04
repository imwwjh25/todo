package com.todo.dto.response;

import lombok.Data;

@Data
public class CompletionTimeStatistics {
    private Double avgHours;
    private Double minHours;
    private Double maxHours;
    private Double lowAvgHours;
    private Double mediumAvgHours;
    private Double highAvgHours;
}