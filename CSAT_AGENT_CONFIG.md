# CSAT (Customer Satisfaction) Agent Configuration

## Overview
This document describes the configuration for a Customer Satisfaction survey agent that collects user ratings and feedback after loan details interaction.

## Agent Purpose
Collect customer satisfaction ratings and feedback when users click "Rate our chat" button from the loan details screen.

## Agent Configuration

### 1. Basic Settings

**Agent Name**: Yellow Bank - CSAT Survey Agent
**Language**: English (en)
**Agent Type**: Survey/Feedback Collection
**Trigger**: Redirected from Banking Agent

### 2. System Prompt

```
You are a friendly customer satisfaction survey assistant for Yellow Bank. Your role is to collect feedback about the user's experience with the banking agent.

Your objectives:
1. Greet the user warmly
2. Ask for a rating (Good, Average, or Bad)
3. Collect optional feedback text
4. Thank the user for their feedback
5. End the conversation gracefully

Keep interactions brief and professional. Do not ask unnecessary questions.
```

### 3. Intent Configuration

#### Intent: start_csat_survey

**Trigger**: When user is redirected from banking agent

**Training Phrases**:
- "Rate our chat" (from button click)
- "I want to rate the chat"
- "Feedback"
- "Survey"

**Action**: Start CSAT collection flow

### 4. Slot Configuration

#### Slot 1: csat_rating

**Slot Name**: `csat_rating`
**Type**: Categorical
**Options**: ["Good", "Average", "Bad"]
**Required**: Yes
**Prompt**: "How would you rate your experience with our banking assistant? Please choose: Good, Average, or Bad."

**Collection Method**: Quick Reply Buttons

#### Slot 2: csat_feedback

**Slot Name**: `csat_feedback`
**Type**: Text
**Required**: No (optional)
**Prompt**: "Thank you for your rating! Would you like to share any additional feedback? (This is optional)"
**Collection Method**: Free text input

### 5. Conversation Flow

```
┌─────────────────────────────────────────────────────────────┐
│         User Clicks "Rate our chat" Button                  │
│         (Redirected from Banking Agent)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent: "Thank you for using Yellow Bank's services!       │
│          We'd love to hear about your experience.          │
│          How would you rate your experience with our       │
│          banking assistant?"                                │
│                                                             │
│  [Quick Replies: Good | Average | Bad]                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              User Selects Rating                            │
│              (Good, Average, or Bad)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent: "Thank you for your rating! Would you like to      │
│          share any additional feedback? (This is optional)" │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
            ┌───────────┐  ┌──────────────┐
            │   User    │  │     User     │
            │ Provides  │  │   Skips      │
            │ Feedback  │  │  Feedback    │
            └─────┬─────┘  └──────┬───────┘
                  │               │
                  └───────┬───────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent: "Thank you for your valuable feedback! We truly     │
│          appreciate your time. Your feedback helps us       │
│          improve our services. Have a great day!"           │
│                                                             │
│  [End Session]                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6. Quick Reply Configuration

#### Rating Selection Quick Replies

**Configuration**:
```json
{
  "text": "How would you rate your experience with our banking assistant?",
  "quickReplies": [
    {
      "type": "button",
      "title": "Good",
      "payload": "rating_good",
      "value": "Good"
    },
    {
      "type": "button",
      "title": "Average",
      "payload": "rating_average",
      "value": "Average"
    },
    {
      "type": "button",
      "title": "Bad",
      "payload": "rating_bad",
      "value": "Bad"
    }
  ]
}
```

### 7. Data Collection Workflow

#### Workflow: storeCSATFeedback

**Workflow Name**: `storeCSATFeedback`

**Trigger**: After collecting rating and optional feedback

**Input Parameters**:
```json
{
  "rating": "{{csat_rating}}",
  "feedback": "{{csat_feedback}}",
  "userId": "{{userId}}",
  "sessionId": "{{sessionId}}",
  "timestamp": "{{currentTimestamp}}"
}
```

**API Configuration** (Optional - for storing feedback):
- **Method**: POST
- **URL**: `https://your-beeceptor-url.free.beeceptor.com/store-csat`
- **Body**:
```json
{
  "rating": "{{csat_rating}}",
  "feedback": "{{csat_feedback}}",
  "userId": "{{userId}}",
  "sessionId": "{{sessionId}}",
  "timestamp": "{{currentTimestamp}}"
}
```

**Response Handling**:
- Log success/failure
- Continue to thank you message

### 8. Response Templates

#### Greeting Message
```
Thank you for using Yellow Bank's services! We'd love to hear about your experience. How would you rate your experience with our banking assistant?
```

#### After Rating Collection
```
Thank you for your rating! Would you like to share any additional feedback? (This is optional)
```

#### Final Thank You Message
```
Thank you for your valuable feedback! We truly appreciate your time. Your feedback helps us improve our services. Have a great day!
```

#### Skip Feedback Message
```
Thank you for your time! Your feedback helps us improve our services. Have a great day!
```

### 9. Integration with Banking Agent

#### Redirect Configuration

In the Banking Agent's `loanDetails` DRM, configure the "Rate our chat" button:

```json
{
  "type": "button",
  "title": "Rate our chat",
  "payload": "redirect_to_csat",
  "url": "{{csatAgentUrl}}",
  "action": "redirect"
}
```

**CSAT Agent URL Format**:
- Yellow.ai internal redirect: Use agent ID or name
- External redirect: Full URL to CSAT agent

#### Context Passing (Optional)

If you want to pass context from Banking Agent to CSAT Agent:

```json
{
  "url": "{{csatAgentUrl}}?userId={{userId}}&sessionId={{sessionId}}"
}
```

### 10. Edge Case Handling

#### User Provides Invalid Rating
- Validate that rating is one of: Good, Average, Bad
- If invalid, re-prompt with quick replies

#### User Provides Rating but No Feedback
- Accept and proceed to thank you message
- Do not force feedback collection

#### User Tries to Skip Rating
- Rating is required
- Re-prompt until valid rating is provided
- Maximum 3 attempts, then end session gracefully

#### User Provides Very Long Feedback
- Accept feedback (no character limit recommended)
- Store as-is
- Thank user for detailed feedback

### 11. Analytics and Reporting

**Metrics to Track**:
- Total CSAT surveys completed
- Rating distribution (Good vs Average vs Bad)
- Feedback collection rate (optional feedback provided)
- Average feedback length
- Drop-off rate (users who start but don't complete)

**Sample Analytics Query**:
```javascript
// Pseudo-code for analytics
const csatMetrics = {
  totalSurveys: countCompletedSurveys(),
  ratingDistribution: {
    good: countRatings("Good"),
    average: countRatings("Average"),
    bad: countRatings("Bad")
  },
  feedbackRate: (countWithFeedback() / totalSurveys) * 100,
  averageFeedbackLength: calculateAverageLength()
};
```

### 12. Testing Checklist

- [ ] CSAT agent starts when redirected from banking agent
- [ ] Rating quick replies display correctly
- [ ] User can select Good, Average, or Bad
- [ ] Optional feedback prompt appears after rating
- [ ] User can provide feedback or skip
- [ ] Thank you message displays correctly
- [ ] Session ends gracefully after completion
- [ ] Invalid rating input is handled
- [ ] Feedback is stored correctly (if API configured)
- [ ] Context is passed correctly (if configured)

### 13. Mock API for CSAT Storage (Beeceptor)

#### Endpoint: `/store-csat`

**Method**: POST

**Request Body**:
```json
{
  "rating": "Good",
  "feedback": "The agent was very helpful and quick to respond.",
  "userId": "user123",
  "sessionId": "session456",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Feedback stored successfully",
  "feedbackId": "fb789"
}
```

**Beeceptor Rule Configuration**:
- Method: POST
- Path: `/store-csat`
- Response Code: 200
- Response Body: Use the response JSON above

### 14. Sample Conversation

```
Agent: Thank you for using Yellow Bank's services! We'd love to hear about your experience. How would you rate your experience with our banking assistant?

[User clicks "Good"]

Agent: Thank you for your rating! Would you like to share any additional feedback? (This is optional)

User: The agent was very helpful and quick to respond.

Agent: Thank you for your valuable feedback! We truly appreciate your time. Your feedback helps us improve our services. Have a great day!
```

### 15. Deployment Steps

1. Create CSAT agent in Yellow.ai dashboard
2. Configure system prompt
3. Set up slots (rating and feedback)
4. Configure quick replies for rating selection
5. Create workflow for storing feedback (optional)
6. Configure redirect from banking agent
7. Test complete flow
8. Deploy to production

## Best Practices

1. **Keep it brief**: CSAT surveys should be quick and non-intrusive
2. **Make feedback optional**: Don't force users to provide detailed feedback
3. **Thank users**: Always acknowledge their time and feedback
4. **Store data**: If possible, store feedback for analysis
5. **Respect privacy**: Don't ask for personal information in CSAT
6. **Analyze trends**: Regularly review ratings and feedback to improve the banking agent
