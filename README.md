# Home Library Service

## Prerequisites

- Install Docker
- Create file .env (use .env.example as a basis)

## Running application

```
docker-compose up --build
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

## Scanning application

```
docker scout cves
```

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```
docker exec -it app sh -c "npm run test"
```

To run only one of all test suites

```
docker exec -it app sh -c "npm run test -- <path to suite>"
```

To run all test with authorization

```
docker exec -it app sh -c "npm run test:auth"
```

To run only specific test suite with authorization

```
docker exec -it app sh -c "npm run test:auth -- <path to suite>"
```

### Auto-fix and format

```
docker exec -it app sh -c "npm run lint"
```

```
docker exec -it app sh -c "npm run format"
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging
