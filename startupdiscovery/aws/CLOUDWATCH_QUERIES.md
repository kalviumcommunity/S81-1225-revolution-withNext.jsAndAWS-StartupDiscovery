# CloudWatch Logs Insights Query Examples

This document contains useful CloudWatch Logs Insights queries for monitoring the StartupDiscovery application.

## Prerequisites

- Log Group: `/ecs/startupdiscovery-nextjs`
- Structured JSON logs with fields: `timestamp`, `level`, `message`, `requestId`, `endpoint`, `method`, `statusCode`, `duration`, `userId`

## Query Examples

### 1. Find All Errors (Last 1 Hour)

```
fields @timestamp, level, message, requestId, endpoint, statusCode, error.message, error.stack
| filter level = "error"
| sort @timestamp desc
| limit 100
```

**Use Case:** Quickly identify recent errors in your application

---

### 2. Track Error Rate Over Time

```
fields @timestamp, level
| filter level = "error"
| stats count() as errorCount by bin(5m)
```

**Use Case:** Visualize error trends and spikes

---

### 3. API Response Time Analysis

```
fields @timestamp, endpoint, method, duration, statusCode
| filter duration > 0
| stats avg(duration) as avg_ms, max(duration) as max_ms, min(duration) as min_ms, count() as request_count by endpoint
| sort avg_ms desc
```

**Use Case:** Identify slow endpoints that need optimization

---

### 4. Find Slow Requests (>2 seconds)

```
fields @timestamp, endpoint, method, duration, requestId, userId
| filter duration > 2000
| sort duration desc
| limit 50
```

**Use Case:** Debug performance issues and slow queries

---

### 5. Request Volume by Endpoint

```
fields endpoint, method
| stats count() as requests by endpoint, method
| sort requests desc
| limit 20
```

**Use Case:** Understand traffic patterns and popular endpoints

---

### 6. HTTP Status Code Distribution

```
fields statusCode
| filter statusCode > 0
| stats count() as count by statusCode
| sort statusCode asc
```

**Use Case:** Monitor API health and error rates

---

### 7. Track Specific User Activity

```
fields @timestamp, userId, endpoint, method, statusCode, message
| filter userId = "user_12345"
| sort @timestamp desc
| limit 100
```

**Use Case:** Debug user-specific issues or track suspicious activity

---

### 8. Trace Requests by Request ID

```
fields @timestamp, message, level, endpoint, statusCode, duration
| filter requestId = "req_abc123xyz"
| sort @timestamp asc
```

**Use Case:** Follow a complete request flow for debugging

---

### 9. 4xx Client Errors

```
fields @timestamp, endpoint, method, statusCode, message, requestId
| filter statusCode >= 400 and statusCode < 500
| stats count() as count by statusCode, endpoint
| sort count desc
```

**Use Case:** Identify client-side validation or authentication issues

---

### 10. 5xx Server Errors

```
fields @timestamp, endpoint, method, statusCode, message, error.message, requestId
| filter statusCode >= 500
| sort @timestamp desc
| limit 50
```

**Use Case:** Critical server errors requiring immediate attention

---

### 11. Authentication Failures

```
fields @timestamp, endpoint, message, userId, requestId
| filter endpoint like /api/auth/ and (statusCode = 401 or statusCode = 403)
| sort @timestamp desc
| limit 100
```

**Use Case:** Monitor authentication and authorization issues

---

### 12. Email Send Success Rate

```
fields @timestamp, message, meta.to, meta.messageId
| filter context = "EmailAPI"
| stats count() as total,
        sum(level = "info" and message = "Email sent successfully") as success,
        sum(level = "error") as errors
| fields total, success, errors, (success * 100.0 / total) as success_rate
```

**Use Case:** Monitor email delivery reliability

---

### 13. Request Duration Percentiles

```
fields duration
| filter duration > 0
| stats pct(duration, 50) as p50,
        pct(duration, 90) as p90,
        pct(duration, 95) as p95,
        pct(duration, 99) as p99
```

**Use Case:** Understand performance distribution (SLA monitoring)

---

### 14. Errors by Context/Service

```
fields @timestamp, context, message, error.message
| filter level = "error"
| stats count() as error_count by context
| sort error_count desc
```

**Use Case:** Identify which service/module has the most errors

---

### 15. API Health Check Over Time

```
fields @timestamp, endpoint, statusCode
| filter endpoint = "/api/health"
| stats count() as total,
        sum(statusCode = 200) as healthy,
        sum(statusCode != 200) as unhealthy by bin(5m)
| fields @timestamp, total, healthy, unhealthy, (healthy * 100.0 / total) as uptime_percent
```

**Use Case:** Monitor application uptime and availability

---

### 16. Correlation ID Usage Analysis

```
fields requestId
| filter requestId != ""
| stats count() as requests_with_id,
        count_distinct(requestId) as unique_requests
```

**Use Case:** Verify correlation ID implementation

---

### 17. Find All Logs for a Specific Time Window

```
fields @timestamp, level, message, endpoint, requestId
| filter @timestamp >= "2026-01-22T10:00:00" and @timestamp <= "2026-01-22T11:00:00"
| sort @timestamp asc
```

**Use Case:** Incident investigation for specific time periods

---

### 18. Database Query Performance (if logged)

```
fields @timestamp, message, meta.query, meta.duration
| filter message like "Database query"
| stats avg(meta.duration) as avg_ms,
        max(meta.duration) as max_ms by meta.query
| sort avg_ms desc
| limit 20
```

**Use Case:** Identify slow database queries

---

### 19. Request Rate per Minute

```
fields @timestamp
| stats count() as requests by bin(1m)
| sort @timestamp desc
```

**Use Case:** Monitor traffic patterns and detect unusual spikes

---

### 20. Environment-Specific Error Analysis

```
fields @timestamp, environment, level, message, endpoint
| filter level = "error"
| stats count() as error_count by environment, endpoint
| sort error_count desc
```

**Use Case:** Compare error rates across environments (dev/staging/prod)

---

## Advanced Queries

### Find Memory Leaks or Resource Issues

```
fields @timestamp, message, meta
| filter message like "memory" or message like "heap"
| sort @timestamp desc
```

### Detect Suspicious Activity

```
fields @timestamp, userId, endpoint, method, statusCode
| filter statusCode = 401 or statusCode = 403
| stats count() as failed_attempts by userId, bin(5m)
| filter failed_attempts > 10
| sort failed_attempts desc
```

### Monitor Rate Limiting

```
fields @timestamp, endpoint, statusCode, message
| filter statusCode = 429
| stats count() as rate_limited by endpoint, bin(5m)
| sort rate_limited desc
```

## Tips for Effective Querying

1. **Use Time Ranges**: Always specify appropriate time ranges to improve query performance
2. **Limit Results**: Use `limit` to avoid overwhelming results
3. **Index Fields**: Filter on indexed fields (`@timestamp`, `level`, `statusCode`) for faster queries
4. **Bin Data**: Use `bin()` for time-series aggregations (e.g., `bin(5m)` for 5-minute intervals)
5. **Save Queries**: Save frequently used queries in CloudWatch for quick access
6. **Create Dashboards**: Add query results to dashboards for real-time monitoring
7. **Set Up Alerts**: Convert critical queries into CloudWatch Alarms

## Useful Log Patterns for Metric Filters

```
# Count errors
{ $.level = "error" }

# Track slow requests
{ $.duration > 2000 }

# Monitor specific endpoints
{ $.endpoint = "/api/auth/login" }

# Track user-specific events
{ $.userId = "user_*" }

# Monitor status codes
{ ($.statusCode >= 500) }
```

## Additional Resources

- [CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [CloudWatch Logs Insights Sample Queries](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-examples.html)
- [Best Practices for CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html)
