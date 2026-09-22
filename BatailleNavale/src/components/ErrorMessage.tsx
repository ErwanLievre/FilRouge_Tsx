type ErrorMessageProps = {
    message: string | null;
};

function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) {
        return null;
    }

    return (
        <p className="error-message" role="alert">
            {message}
        </p>
    );
}

export default ErrorMessage;
