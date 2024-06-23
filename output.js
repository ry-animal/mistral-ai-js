let output = {
    id: "d1d057bcc4514646b19b86660f61ac2f", 
    object: "chat.completion", 
    created: 1711036261, 
    model: "mistral-large-latest", 
    choices: [{
        index: 0, 
        message: {
            role: "assistant", 
            content: "", 
            tool_calls: [{
                function: {
                    name: "getPaymentStatus", 
                    arguments: '{"transactionId": "T1001"}'
                }
            }]
        }, 
        finish_reason: "tool_calls",
        logprobs: null
    }],
    usage: {
        prompt_tokens: 84, 
        total_tokens: 110, 
        completion_tokens: 26
    }
};