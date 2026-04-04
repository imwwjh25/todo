package com.todo.controller;

import com.todo.common.result.Result;
import com.todo.dto.response.CategoryStatistics;
import com.todo.dto.response.CompletionTimeStatistics;
import com.todo.dto.response.PriorityStatistics;
import com.todo.dto.response.TrendStatistics;
import com.todo.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/by-category")
    public Result<List<CategoryStatistics>> getByCategory() {
        return Result.success(statisticsService.getByCategory());
    }

    @GetMapping("/by-priority")
    public Result<List<PriorityStatistics>> getByPriority() {
        return Result.success(statisticsService.getByPriority());
    }

    @GetMapping("/trend")
    public Result<TrendStatistics> getTrend(
            @RequestParam(defaultValue = "daily") String period,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return Result.success(statisticsService.getTrend(period, start, end));
    }

    @GetMapping("/completion-time")
    public Result<CompletionTimeStatistics> getCompletionTime() {
        return Result.success(statisticsService.getCompletionTime());
    }
}