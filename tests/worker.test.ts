import {
  env,
  fetchMock,
  createExecutionContext,
  waitOnExecutionContext,
  SELF,
} from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCacheKey } from "~/utils";
import worker from "./worker";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Simulated worker integration tests", () => {
  const mockedData = {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
  };

  beforeEach(() => {
    fetchMock.activate();
    fetchMock.disableNetConnect();
    fetchMock
      .get("https://jsonplaceholder.typicode.com")
      .intercept({
        path: /\/users\/\d+/,
        method: "GET",
      })
      .reply(200, mockedData);
  });

  afterEach(() => {
    fetchMock.deactivate();
  });

  it("should successfully build and call the worker", async () => {
    const response = await SELF.fetch("https://www.worker.com?userId=1");
    const data = await response.json();
    expect(data).toEqual(mockedData);
  });
});

describe("Imported worker integration tests", () => {
  const mockedData = {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
  };
  let ctx: ExecutionContext;
  const keyPrefix = "mycache";

  beforeEach(() => {
    fetchMock.activate();
    fetchMock.disableNetConnect();
    fetchMock
      .get("https://jsonplaceholder.typicode.com")
      .intercept({
        path: /\/users\/\d+/,
        method: "GET",
      })
      .reply(200, mockedData);
    ctx = createExecutionContext();
  });

  afterEach(() => {
    fetchMock.deactivate();
  });

  it("should successfully response with mocked data", async () => {
    const request = new IncomingRequest("http://example.com?userId=1");
    // Create an empty context to pass to `worker.fetch()`.
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(await response.json()).toEqual(mockedData);

    const storedValue = await env.KV.getWithMetadata(`${buildCacheKey("user-1", keyPrefix)}`);
    expect(JSON.parse(storedValue.value ?? "{}")).toEqual(mockedData);
  });
});
