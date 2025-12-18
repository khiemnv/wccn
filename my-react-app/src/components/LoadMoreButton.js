import { Button } from "@mui/material";

export function LoadMoreButton({ onClick, loading, disabled, children: label, ...props }) {
    return (
        <Button
            onClick={onClick}
            disabled={loading || disabled}
            sx={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
            }}
            {...props}
        >
            {loading ? "Loading..." : label}
        </Button>
    );
}