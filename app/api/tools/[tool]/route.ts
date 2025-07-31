import { routes } from '@genesyshub/tools/route';
import { NextRequest, NextResponse } from 'next/server';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function handlerFor(method: Method, tool: string, req: NextRequest) {
  //@ts-ignore
  const toolRoutes = routes[tool];
  if (!toolRoutes) {
    return NextResponse.json({ error: `Tool "${tool}" not found` }, { status: 404 });
  }
  const methodHandler = toolRoutes[method];
  if (!methodHandler) {
    return NextResponse.json(
      { error: `Method ${method} not allowed for tool "${tool}"` },
      { status: 405 },
    );
  }
  return methodHandler(req);
}

//Use GET from the tool, or return the tool object data (default).
export async function GET(req: NextRequest, context: any) {
  const { tool } = await context.params;
  const handlerResponse = await handlerFor('GET', tool, req);
  if (handlerResponse) {
    try {
      const cloned = handlerResponse.clone();
      const json = await cloned.json();

      if (
        json?.error &&
        typeof json.error === 'string' &&
        json.error.includes(`Method GET not allowed for tool "${tool}"`)
      ) {
      } else {
        return handlerResponse;
      }
    } catch {
      return handlerResponse;
    }
  }

  try {
    const routeMod = tool && await import(`./${tool}/route`);
    if (typeof routeMod.GET === 'function') {
      return routeMod.GET(req, context);
    }
  } catch {}

  const toolsMod = await import('@genesyshub/tools/index').then((mod) => mod.tools);
  //@ts-ignore
  const toolMeta = toolsMod[tool];
  if (!toolMeta) {
    return NextResponse.json({ error: `Tool ${tool} not found` }, { status: 404 });
  }

  const { call, ...rest } = toolMeta;

  return NextResponse.json({
    ...rest,
    call: `/api/tools/${tool}`,
  });
}

export async function POST(req: NextRequest, context: any) {
  return handlerFor('POST', context.params.tool, req);
}
