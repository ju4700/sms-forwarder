# Custom JSON Template Feature

## Overview

The app now supports custom JSON templates, allowing you to define exactly what data is sent to your API endpoint. This gives you complete control over the payload structure.

## How It Works

1. **Default Behavior**: If no custom template is set, the app sends the default JSON structure
2. **Custom Template**: Define your own JSON structure using variables that get replaced with actual SMS data

## Available Variables

### Basic Variables

- `{{sender}}` - SMS sender phone number
- `{{content}}` - Full SMS message content
- `{{receivedAt}}` - ISO 8601 timestamp when SMS was received
- `{{timestamp}}` - Unix timestamp (milliseconds)
- `{{matchedKeyword}}` - The keyword that matched (if any)
- `{{transactionId}}` - Extracted transaction ID (auto-detected)
- `{{referenceId}}` - Extracted reference ID (auto-detected)
- `{{amount}}` - Extracted amount (auto-detected)

### Custom Regex Extraction

Use `{{regex:pattern:group}}` to extract custom data from SMS content:

- `pattern` - Regular expression pattern
- `group` - Capture group index (usually 1 for first capture group)

**Example:**
```json
{
  "code": "{{regex:Code:\s*(\d+):1}}",
  "orderId": "{{regex:Order\s*#(\w+):1}}"
}
```

## Examples

### Example 1: Simple Transaction ID Only

```json
{
  "transactionId": "{{transactionId}}"
}
```

**Result:**
```json
{
  "transactionId": "ABC123XYZ"
}
```

### Example 2: Custom Structure with Multiple Fields

```json
{
  "payment": {
    "id": "{{transactionId}}",
    "amount": {{amount}},
    "from": "{{sender}}",
    "time": "{{receivedAt}}"
  },
  "metadata": {
    "keyword": "{{matchedKeyword}}"
  }
}
```

**Result:**
```json
{
  "payment": {
    "id": "ABC123XYZ",
    "amount": 1000,
    "from": "+8801712345678",
    "time": "2024-01-01T12:00:00.000Z"
  },
  "metadata": {
    "keyword": "payment"
  }
}
```

### Example 3: Extract Custom Code

If your SMS format is: "Your code is 123456"

```json
{
  "verificationCode": "{{regex:code\s+is\s+(\d+):1}}",
  "sender": "{{sender}}"
}
```

**Result:**
```json
{
  "verificationCode": "123456",
  "sender": "+8801712345678"
}
```

### Example 4: Minimal Payload

```json
{
  "txn": "{{transactionId}}",
  "amt": {{amount}}
}
```

**Result:**
```json
{
  "txn": "ABC123XYZ",
  "amt": 1000
}
```

## Usage in Settings

1. Go to **Settings** tab
2. Scroll to **Custom JSON Template** section
3. Click **Show JSON Template Editor**
4. Enter your JSON template
5. Click **Save Settings**

## Template Rules

1. **Valid JSON**: The template must be valid JSON
2. **Variable Replacement**: Variables are replaced before JSON parsing
3. **String Values**: Variables in string positions are automatically quoted
4. **Number Values**: Use variables directly for numbers (e.g., `{{amount}}`)
5. **Empty Values**: If a variable has no value, it becomes empty string `""` or `0` for numbers

## Default JSON Structure

If no custom template is set, the app sends:

```json
{
  "sender": "+8801712345678",
  "content": "You received BDT 1000. TrxID: ABC123",
  "receivedAt": "2024-01-01T12:00:00.000Z",
  "referenceId": "ABC123",
  "transactionId": "ABC123",
  "amount": 1000,
  "matchedKeyword": "payment"
}
```

## Tips

1. **Test Your Template**: Use the "Simulate Test SMS" button in Monitor tab to test
2. **Check Forwarded Tab**: See if the API call succeeded
3. **Validate JSON**: Make sure your template is valid JSON before saving
4. **Escape Special Characters**: Variables are automatically escaped, but be careful with regex patterns
5. **Use Regex Wisely**: Test your regex patterns to ensure they match your SMS format

## Common Patterns

### Extract OTP Code
```json
{
  "otp": "{{regex:OTP[:\s]+(\d{4,6}):1}}"
}
```

### Extract Account Number
```json
{
  "account": "{{regex:Account[:\s]+(\d+):1}}"
}
```

### Extract Balance
```json
{
  "balance": {{regex:Balance[:\s]+([\d,]+):1}}
}
```

## Troubleshooting

### Template Not Working?

1. **Check JSON Syntax**: Ensure valid JSON (use a JSON validator)
2. **Check Variables**: Make sure variable names are correct (case-sensitive)
3. **Check Regex**: Test regex patterns separately
4. **Check Logs**: Look at Forwarded tab for error messages

### Variables Empty?

- Some variables (like `transactionId`, `amount`) are auto-extracted
- If extraction fails, they'll be empty
- Use custom regex patterns for specific formats

### API Not Receiving Data?

1. Check if monitoring is enabled
2. Check if SMS matches keywords
3. Check Forwarded tab for errors
4. Verify API endpoint is correct

## Advanced Usage

### Nested Objects
```json
{
  "data": {
    "transaction": {
      "id": "{{transactionId}}",
      "amount": {{amount}}
    }
  }
}
```

### Arrays
```json
{
  "items": [
    {
      "type": "sms",
      "content": "{{content}}"
    }
  ]
}
```

### Conditional-like Structure
```json
{
  "hasTransaction": {{#if transactionId}}true{{else}}false{{/if}}
}
```
*Note: This is just an example structure - actual conditional logic would need custom implementation*
