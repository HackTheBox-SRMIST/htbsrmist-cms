const Badge = ({ status, variant }) => {
    // Define styles for each variant
    const variantStyles = {
        success: "dark:bg-dark-success-background bg-light-success-background dark:text-dark-success-color text-light-success-color",
        error: "dark:bg-dark-warn-background bg-light-error-background dark:text-dark-error-color text-light-error-color",
        general: "dark:bg-dark-info-background bg-light-info-background dark:bg-dark-info-color bg-light-info-color"
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${variantStyles[variant]}`}
        >
            {status}
        </span>
    );
};

export default Badge;
