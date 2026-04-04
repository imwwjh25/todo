package com.todo.service;

import com.todo.dto.response.CategoryStatistics;
import com.todo.dto.response.CompletionTimeStatistics;
import com.todo.dto.response.PriorityStatistics;
import com.todo.dto.response.TrendStatistics;
import java.time.LocalDate;
import java.util.List;

public interface StatisticsService {
    List<CategoryStatistics> getByCategory();
    List<PriorityStatistics> getByPriority();
    TrendStatistics getTrend(String period, LocalDate start, LocalDate end);
    CompletionTimeStatistics getCompletionTime();
}