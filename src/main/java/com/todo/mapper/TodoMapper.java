package com.todo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.todo.entity.TodoItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface TodoMapper extends BaseMapper<TodoItem> {
    List<TodoItem> findByCategoryId(@Param("categoryId") Long categoryId);
}