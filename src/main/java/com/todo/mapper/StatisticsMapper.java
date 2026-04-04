package com.todo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface StatisticsMapper {
    // 按分类统计
    List<Map<String, Object>> statisticsByCategory();

    // 按优先级统计
    List<Map<String, Object>> statisticsByPriority();

    // 时间趋势统计
    List<Map<String, Object>> statisticsTrend(
        @Param("period") String period,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // 平均完成耗时
    Map<String, Object> completionTimeStatistics();
}