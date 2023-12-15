import { ModelGatewayRouteType, ModelGatewayService } from './ModelGatewayService';
import { fetchEndpoint } from '../../common/utils/FetchUtils';

jest.mock('../../common/utils/FetchUtils', () => ({
  ...jest.requireActual('../../common/utils/FetchUtils'),
  fetchEndpoint: jest.fn(),
}));

describe('ModelGatewayService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Creates a request call to the completions model route', () => {
    ModelGatewayService.queryModelGatewayRoute(
      {
        model: { name: 'completions_model', provider: 'closed-ai' },
        name: 'completions_route',
        endpoint_type: ModelGatewayRouteType.LLM_V1_COMPLETIONS,
        endpoint_url: '/gateway/completions/invocations',
      },
      { inputText: 'input text', parameters: { temperature: 0.5, max_tokens: 50 } },
    );

    expect(fetchEndpoint).toBeCalledWith(
      expect.objectContaining({
        body: JSON.stringify({ prompt: 'input text', temperature: 0.5, max_tokens: 50 }),
      }),
    );
  });

  test('Creates a request call to the chat model route', () => {
    ModelGatewayService.queryModelGatewayRoute(
      {
        model: { name: 'chat_model', provider: 'closed-ai' },
        name: 'chat_route',
        endpoint_type: ModelGatewayRouteType.LLM_V1_CHAT,
        endpoint_url: '/gateway/chat/invocations',
      },
      { inputText: 'input text', parameters: { temperature: 0.5, max_tokens: 50 } },
    );

    expect(fetchEndpoint).toBeCalledWith(
      expect.objectContaining({
        body: JSON.stringify({
          messages: [{ content: 'input text', role: 'user' }],
          temperature: 0.5,
          max_tokens: 50,
        }),
      }),
    );
  });

  test('Attempts to call unsupported embeddings model route', () => {
    const callEmbeddingsRoute = () =>
      ModelGatewayService.queryModelGatewayRoute(
        {
          model: { name: 'chat_model', provider: 'closed-ai' },
          name: 'chat_route',
          endpoint_type: ModelGatewayRouteType.LLM_V1_EMBEDDINGS,
          endpoint_url: '/gateway/embeddings/invocations',
        },
        { inputText: 'input text', parameters: { temperature: 0.5, max_tokens: 50 } },
      );

    expect(callEmbeddingsRoute).toThrowError();
  });
});
