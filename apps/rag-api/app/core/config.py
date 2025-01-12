import structlog
import logging

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

SUPPORTED_CONTENT_TYPES = {
    "application/pdf",
    "application/json",
    "text/html",
    "text/javascript",
    "application/javascript",
    "text/plain",
    "text/css",
    "text/markdown",
    "text/yaml",
    "text/xml",
}
