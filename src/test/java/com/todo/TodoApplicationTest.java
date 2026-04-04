package com.todo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class TodoApplicationTest {

    @Test
    void contextLoads() {
        // 验证 Spring 上下文能够正常加载
    }
}