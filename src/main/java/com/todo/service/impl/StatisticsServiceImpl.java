package com.todo.service.impl;

import com.todo.dto.response.CategoryStatistics;
import com.todo.dto.response.CompletionTimeStatistics;
import com.todo.dto.response.PriorityStatistics;
import com.todo.dto.response.TrendStatistics;
import com.todo.mapper.StatisticsMapper;
import com.todo.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final StatisticsMapper statisticsMapper;

    @Override
    @Cacheable(value = "stats:category")
    public List<CategoryStatistics> getByCategory() {
        List<Map<String, Object>> results = statisticsMapper.statisticsByCategory();
        return results.stream().map(this::mapToCategoryStats).toList();
    }

    @Override
    @Cacheable(value = "stats:priority")
    public List<PriorityStatistics> getByPriority() {
        List<Map<String, Object>> results = statisticsMapper.statisticsByPriority();
        return results.stream().map(this::mapToPriorityStats).toList();
    }

    @Override
    @Cacheable(value = "stats:trend", key = "#period + ':' + #start + ':' + #end")
    public TrendStatistics getTrend(String period, LocalDate start, LocalDate end) {
        List<Map<String, Object>> results = statisticsMapper.statisticsTrend(period, start, end);
        TrendStatistics stats = new TrendStatistics();
        stats.setPeriod(period);
        stats.setData(results);
        return stats;
    }

    @Override
    @Cacheable(value = "stats:completion-time")
    public CompletionTimeStatistics getCompletionTime() {
        Map<String, Object> result = statisticsMapper.completionTimeStatistics();
        return mapToCompletionTimeStats(result);
    }

    private CategoryStatistics mapToCategoryStats(Map<String, Object> map) {
        CategoryStatistics stats = new CategoryStatistics();
        stats.setCategoryId(((Number) map.get("categoryId")).longValue());
        stats.setCategoryName((String) map.get("categoryName"));
        stats.setTotalCount(((Number) map.get("totalCount")).longValue());
        stats.setCompletedCount(((Number) map.get("completedCount")).longValue());
        stats.setCompletionRate((Double) map.get("completionRate"));
        return stats;
    }

    private PriorityStatistics mapToPriorityStats(Map<String, Object> map) {
        PriorityStatistics stats = new PriorityStatistics();
        stats.setPriority(((Number) map.get("priority")).intValue());
        stats.setPriorityName((String) map.get("priorityName"));
        stats.setTotalCount(((Number) map.get("totalCount")).longValue());
        stats.setCompletedCount(((Number) map.get("completedCount")).longValue());
        stats.setCompletionRate((Double) map.get("completionRate"));
        stats.setOverdueCount(((Number) map.get("overdueCount")).longValue());
        return stats;
    }

    private CompletionTimeStatistics mapToCompletionTimeStats(Map<String, Object> map) {
        CompletionTimeStatistics stats = new CompletionTimeStatistics();
        if (map != null) {
            stats.setAvgHours(getDouble(map, "avgHours"));
            stats.setMinHours(getDouble(map, "minHours"));
            stats.setMaxHours(getDouble(map, "maxHours"));
            stats.setLowAvgHours(getDouble(map, "lowAvgHours"));
            stats.setMediumAvgHours(getDouble(map, "mediumAvgHours"));
            stats.setHighAvgHours(getDouble(map, "highAvgHours"));
        }
        return stats;
    }

    private Double getDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return 0.0;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }
}