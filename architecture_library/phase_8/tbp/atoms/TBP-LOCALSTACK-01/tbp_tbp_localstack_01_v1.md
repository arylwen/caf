# TBP-LOCALSTACK-01

LocalStack AWS emulator binding for local development.

## Binds to

- `deployment.target: localstack`

## Intent

- When a local AWS emulator is selected, materialize a LocalStack service in the local compose wiring.
- Provide a minimal env contract surface so application code can talk to AWS-emulated endpoints without hardcoding host addresses.

## Notes

- This TBP does **not** choose which AWS services to emulate. Keep the service list minimal-by-default and configurable via env.
- Do not embed secrets in repo config. Use env files and/or runtime env injection.
