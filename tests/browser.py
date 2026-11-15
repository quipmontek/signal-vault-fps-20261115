"""Real Chromium smoke test and unedited captures. Run with the local server on :8080.
Requires Python Playwright and a system Chromium; neither is needed by the artifact.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
    errors, external, failed = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: external.append(r.url) if not r.url.startswith('http://127.0.0.1:8080/') else None)
    page.on('response', lambda r: failed.append(r.url) if r.status >= 400 else None)
    page.goto('http://127.0.0.1:8080/')
    page.wait_for_function('window.__game && window.__view')
    assert page.evaluate('__view.renderer.getContext() instanceof WebGL2RenderingContext')
    page.locator('#play').click()
    page.wait_for_function('document.pointerLockElement !== null')
    page.wait_for_function('__game.s.tick > 5')
    page.keyboard.press('b')
    page.wait_for_function('document.pointerLockElement === null')
    assert page.locator('#shop').is_visible()
    page.locator('#shop button').nth(2).click()
    assert page.evaluate('__game.p.weapon') == 2
    assert page.evaluate('__game.s.credits') == 500
    page.keyboard.press('b')
    page.wait_for_function('document.pointerLockElement !== null')
    page.evaluate('__game.s.left = 0.01')
    page.wait_for_function('__game.s.phase === "live"')
    before = page.evaluate('({x:__game.p.x,z:__game.p.z,yaw:__game.p.yaw,mag:__game.p.mag})')
    page.keyboard.down('w')
    page.wait_for_timeout(450)
    page.keyboard.up('w')
    assert page.evaluate('__game.p.z') < before['z']
    page.mouse.move(670, 350)
    page.mouse.down()
    page.wait_for_timeout(150)
    page.mouse.up()
    assert page.evaluate('__game.p.mag') < before['mag']
    page.keyboard.press('r')
    page.wait_for_function('__game.p.reload > 0')
    page.keyboard.press('g')
    assert page.evaluate('__game.s.emp.length') == 1
    page.keyboard.down('Tab')
    assert page.locator('#roster').is_visible()
    page.keyboard.up('Tab')
    page.keyboard.press('Escape')
    page.wait_for_function('document.pointerLockElement === null')
    tick = page.evaluate('__game.s.tick')
    page.wait_for_timeout(150)
    assert page.evaluate('__game.s.tick') == tick
    for filename, scene in [('01-combat.jpg', 'combat'), ('02-well.jpg', 'well'),
                            ('03-relay.jpg', 'relay'), ('04-armory.jpg', 'armory')]:
        page.goto('http://127.0.0.1:8080/?shot=' + scene)
        page.wait_for_function('window.__shotReady === true')
        assert page.evaluate('__game.p.alive')
        page.screenshot(path=str(ROOT / 'screenshots' / filename), type='jpeg', quality=87)
    assert not errors, errors
    assert not external, external
    assert not failed, failed
    print(json.dumps({'webgl2': True, 'page_errors': errors, 'external_requests': external,
                      'failed_responses': failed, 'screenshots': 4,
                      'last_draw_calls': page.evaluate('__view.renderer.info.render.calls'),
                      'interactive_smoke': 'passed'}))
    browser.close()
