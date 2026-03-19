# CAF_TRACE: task_id=TG-35-policy-enforcement-core capability=policy_enforcement trace_anchor=pattern_obligation_id:OBL-TENANT-CONTEXT-PROPAGATION
from dataclasses import dataclass
from typing import Mapping

from ...common.auth.mock_claims import parse_mock_claim_from_headers
from .models import PrincipalContextModel

def _principal_kind_from_id(principal_id: str) -> str:
    principal_id_lower = principal_id.lower()
    if principal_id_lower.startswith("platform"):
        return "platform_user"
    if principal_id_lower.startswith("service"):
        return "service_principal"
    return "tenant_user"


@dataclass(frozen=True)
class VerifiedAuthClaim:
    tenant_id: str
    principal_id: str
    policy_version: str
    principal_kind: str
    tenant_header: str | None

    def to_principal_context(self) -> PrincipalContextModel:
        return PrincipalContextModel(
            tenant_id=self.tenant_id,
            principal_id=self.principal_id,
            policy_version=self.policy_version,
            principal_kind=self.principal_kind,
        )


def parse_mock_auth_claim(headers: Mapping[str, str]) -> VerifiedAuthClaim:
    parsed_claim = parse_mock_claim_from_headers(headers)
    return VerifiedAuthClaim(
        tenant_id=parsed_claim.tenant_id,
        principal_id=parsed_claim.principal_id,
        policy_version=parsed_claim.policy_version,
        principal_kind=_principal_kind_from_id(parsed_claim.principal_id),
        tenant_header=parsed_claim.tenant_header,
    )
