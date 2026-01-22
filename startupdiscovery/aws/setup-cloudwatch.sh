#!/bin/bash

# ==============================================================================
# AWS CloudWatch Setup Script for StartupDiscovery
# ==============================================================================
# This script sets up CloudWatch Logs, Metric Filters, and Alarms
# Run this after deploying your ECS service
# ==============================================================================

set -e

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
LOG_GROUP_NAME="/ecs/startupdiscovery-nextjs"
RETENTION_DAYS=14
SNS_TOPIC_ARN="${SNS_TOPIC_ARN:-}"  # Set your SNS topic ARN for alerts

echo "🚀 Setting up AWS CloudWatch for StartupDiscovery..."
echo "Region: $AWS_REGION"
echo "Log Group: $LOG_GROUP_NAME"

# ==============================================================================
# 1. Create CloudWatch Log Group
# ==============================================================================
echo ""
echo "📝 Creating CloudWatch Log Group..."

aws logs create-log-group \
  --log-group-name "$LOG_GROUP_NAME" \
  --region "$AWS_REGION" \
  2>/dev/null || echo "Log group already exists"

# Set retention policy
aws logs put-retention-policy \
  --log-group-name "$LOG_GROUP_NAME" \
  --retention-in-days "$RETENTION_DAYS" \
  --region "$AWS_REGION"

echo "✅ Log group configured with $RETENTION_DAYS days retention"

# ==============================================================================
# 2. Create Metric Filters
# ==============================================================================
echo ""
echo "📊 Creating Metric Filters..."

# Error Count Filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "ErrorCount" \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations \
    metricName=ErrorCount,\
metricNamespace=StartupDiscovery/API,\
metricValue=1,\
defaultValue=0,\
unit=Count \
  --region "$AWS_REGION"

echo "✅ ErrorCount metric filter created"

# API Response Time Filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "APIResponseTime" \
  --filter-pattern '{ $.duration > 0 }' \
  --metric-transformations \
    metricName=APIResponseTime,\
metricNamespace=StartupDiscovery/API,\
metricValue=$.duration,\
unit=Milliseconds \
  --region "$AWS_REGION"

echo "✅ APIResponseTime metric filter created"

# 4xx Errors Filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "4xxErrors" \
  --filter-pattern '{ ($.statusCode >= 400) && ($.statusCode < 500) }' \
  --metric-transformations \
    metricName=4xxErrors,\
metricNamespace=StartupDiscovery/API,\
metricValue=1,\
defaultValue=0,\
unit=Count \
  --region "$AWS_REGION"

echo "✅ 4xxErrors metric filter created"

# 5xx Errors Filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "5xxErrors" \
  --filter-pattern '{ $.statusCode >= 500 }' \
  --metric-transformations \
    metricName=5xxErrors,\
metricNamespace=StartupDiscovery/API,\
metricValue=1,\
defaultValue=0,\
unit=Count \
  --region "$AWS_REGION"

echo "✅ 5xxErrors metric filter created"

# ==============================================================================
# 3. Create CloudWatch Alarms
# ==============================================================================
echo ""
echo "🔔 Creating CloudWatch Alarms..."

# High Error Rate Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "StartupDiscovery-HighErrorRate" \
  --alarm-description "Alert when error count exceeds threshold" \
  --metric-name ErrorCount \
  --namespace StartupDiscovery/API \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --region "$AWS_REGION" \
  ${SNS_TOPIC_ARN:+--alarm-actions "$SNS_TOPIC_ARN"}

echo "✅ High Error Rate alarm created"

# High Response Time Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "StartupDiscovery-HighResponseTime" \
  --alarm-description "Alert when API response time is too high" \
  --metric-name APIResponseTime \
  --namespace StartupDiscovery/API \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 2000 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --region "$AWS_REGION" \
  ${SNS_TOPIC_ARN:+--alarm-actions "$SNS_TOPIC_ARN"}

echo "✅ High Response Time alarm created"

# High 5xx Errors Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "StartupDiscovery-High5xxErrors" \
  --alarm-description "Alert when 5xx errors exceed threshold" \
  --metric-name 5xxErrors \
  --namespace StartupDiscovery/API \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --region "$AWS_REGION" \
  ${SNS_TOPIC_ARN:+--alarm-actions "$SNS_TOPIC_ARN"}

echo "✅ High 5xx Errors alarm created"

# ==============================================================================
# 4. Tag Resources
# ==============================================================================
echo ""
echo "🏷️  Tagging resources..."

aws logs tag-log-group \
  --log-group-name "$LOG_GROUP_NAME" \
  --tags Application=StartupDiscovery,Environment=production,ManagedBy=script \
  --region "$AWS_REGION"

echo "✅ Resources tagged"

# ==============================================================================
# Summary
# ==============================================================================
echo ""
echo "================================================================"
echo "✅ CloudWatch Setup Complete!"
echo "================================================================"
echo ""
echo "📊 Metric Filters Created:"
echo "  • ErrorCount - Tracks application errors"
echo "  • APIResponseTime - Tracks API performance"
echo "  • 4xxErrors - Tracks client errors"
echo "  • 5xxErrors - Tracks server errors"
echo ""
echo "🔔 Alarms Created:"
echo "  • HighErrorRate (>10 errors in 5 min)"
echo "  • HighResponseTime (>2000ms avg over 10 min)"
echo "  • High5xxErrors (>5 errors in 5 min)"
echo ""
echo "📝 Next Steps:"
echo "  1. View logs: aws logs tail '$LOG_GROUP_NAME' --follow --region $AWS_REGION"
echo "  2. View metrics: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#metricsV2:graph=~()"
echo "  3. Set up SNS topic for alarm notifications"
echo "  4. Create CloudWatch Dashboard"
echo ""
echo "================================================================"
