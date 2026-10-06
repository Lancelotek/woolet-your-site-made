import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto("http://localhost:8080/en/collections/extra-large-oversized-eyeglasses"); await pg.wait_for_timeout(2500)
        print(await pg.title()); print(await pg.eval_on_selector_all('link[rel=canonical]','e=>e.map(x=>x.href)')); print(await pg.inner_text('h1'))
        print(await pg.eval_on_selector_all('link[rel=alternate]','e=>e.map(x=>x.hreflang+" "+x.href)'))
        await b.close()
asyncio.run(main())
