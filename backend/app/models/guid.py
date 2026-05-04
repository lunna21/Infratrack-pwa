"""
Tipo UUID compatible con PostgreSQL y SQLite.
PostgreSQL usa su tipo UUID nativo; SQLite almacena como CHAR(36).
"""

import uuid
from sqlalchemy import TypeDecorator, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class GUID(TypeDecorator):
    """
    Tipo UUID portátil:
    - En PostgreSQL utiliza el tipo UUID nativo.
    - En SQLite (y otros) almacena como CHAR(36).
    """

    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value if isinstance(value, uuid.UUID) else uuid.UUID(value)
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value
