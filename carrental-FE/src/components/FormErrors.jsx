function messages(errors) {
    return Object.values(errors).flatMap(error => {
        if (!error || typeof error !== "object") return [];
        return error.message ? [error.message] : messages(error);
    });
}

export function FormErrors({ errors }) {
    const items = [...new Set(messages(errors))];
    if (!items.length) return null;
    return <ul role="alert" className="space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-800">
        {items.map(message => <li key={message}>{message}</li>)}
    </ul>;
}
