type LoadingProps = {
    message?: string;
};

function Loading({ message = "Chargement..." }: LoadingProps) {
    return (
        <div className="loading" role="status">
            {message}
        </div>
    );
}

export default Loading;
