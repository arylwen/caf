# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-20-api-boundary-widget | capability=api_boundary_implementation | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-API
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel

from ..context import RequestContext, context_from_headers
from ..policy_client import enforce_policy
from ..services.widget_service import WidgetService

router = APIRouter(prefix="/widgets", tags=["widgets"])
service = WidgetService()


class WidgetInput(BaseModel):
    name: str
    description: str
    content: str


class WidgetOutput(WidgetInput):
    id: str


@router.get("", response_model=list[WidgetOutput])
def list_widgets(context: RequestContext = Depends(context_from_headers)) -> list[WidgetOutput]:
    enforce_policy(context, action="widget:list")
    return [WidgetOutput(**item) for item in service.list_widgets(tenant_id=context.tenant_id)]


@router.get("/{widget_id}", response_model=WidgetOutput)
def get_widget(widget_id: str, context: RequestContext = Depends(context_from_headers)) -> WidgetOutput:
    enforce_policy(context, action="widget:get")
    found = service.get_widget(tenant_id=context.tenant_id, widget_id=widget_id)
    if not found:
        raise HTTPException(status_code=404, detail="widget_not_found")
    return WidgetOutput(**found)


@router.post("", response_model=WidgetOutput, status_code=status.HTTP_201_CREATED)
def create_widget(
    payload: WidgetInput,
    context: RequestContext = Depends(context_from_headers),
) -> WidgetOutput:
    enforce_policy(context, action="widget:create")
    created = service.create_widget(tenant_id=context.tenant_id, payload=payload.model_dump())
    return WidgetOutput(**created)


@router.put("/{widget_id}", response_model=WidgetOutput)
def update_widget(
    widget_id: str,
    payload: WidgetInput,
    context: RequestContext = Depends(context_from_headers),
) -> WidgetOutput:
    enforce_policy(context, action="widget:update")
    updated = service.update_widget(
        tenant_id=context.tenant_id,
        widget_id=widget_id,
        payload=payload.model_dump(),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="widget_not_found")
    return WidgetOutput(**updated)


@router.delete("/{widget_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_widget(widget_id: str, context: RequestContext = Depends(context_from_headers)) -> Response:
    enforce_policy(context, action="widget:delete")
    deleted = service.delete_widget(tenant_id=context.tenant_id, widget_id=widget_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="widget_not_found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

