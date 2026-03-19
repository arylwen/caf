from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def handle_contract_http(request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    return ContractResponseEnvelope(
        tenant_id=request.tenant_id,
        principal_id=request.principal_id,
        correlation_id=request.correlation_id,
        payload={},
    )

