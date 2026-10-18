import { test, expect } from '@playwright/test';

test.describe('CeceStock — Interacciones Móviles Táctiles y Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada prueba para arrancar en estado puro
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  // Test E2E 1: Flujo de auto-select y auto-advance
  test('Flujo de auto-select y auto-advance: enfocar PT, escribir 12, pulsar Enter y transferir foco a OW', async ({
    page,
  }) => {
    // Localizar inputs de colores (la cuadrícula contiene 13 inputs)
    const inputs = page.locator('input[type="text"][inputmode="numeric"]');
    await expect(inputs).toHaveCount(13);

    const ptInput = inputs.nth(0); // Preto (PT)
    const owInput = inputs.nth(1); // Off White (OW)

    // 1. Enfocar el primer input (PT)
    await ptInput.focus();
    await expect(ptInput).toBeFocused();

    // 2. Escribir '12'
    await page.keyboard.type('12');
    await expect(ptInput).toHaveValue('12');

    // 3. Presionar tecla Enter
    await page.keyboard.press('Enter');

    // 4. Validar que el foco se transfiera automáticamente al segundo input (OW)
    await expect(owInput).toBeFocused();

    // Validar también auto-select: al volver a enfocar PT, debe seleccionar el texto completo
    await ptInput.focus();
    const selectedText = await page.evaluate(() => {
      const activeEl = document.activeElement as HTMLInputElement | null;
      if (!activeEl) return '';
      return activeEl.value.substring(activeEl.selectionStart || 0, activeEl.selectionEnd || 0);
    });
    expect(selectedText).toBe('12');
  });

  // Test E2E 2: Gestos Swipe horizontal >= 60px
  test('Gesto Swipe horizontal >= 60px hacia la izquierda cambia la tarjeta a REF-002 y expande el segundo dot', async ({
    page,
  }) => {
    // Validar que iniciamos en el primer producto (REF-001 - Conjunto Soie)
    await expect(page.locator('main').getByText('REF-001')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Conjunto Soie' })).toBeVisible();

    const dot1 = page.locator('button[aria-label="Ir al producto 1"]');
    const dot2 = page.locator('button[aria-label="Ir al producto 2"]');

    // El primer dot debe estar expandido (w-6) inicialmente
    await expect(dot1).toHaveClass(/w-6/);
    await expect(dot2).not.toHaveClass(/w-6/);

    // Ejecutar swipe táctil horizontal >= 60px hacia la izquierda (deltaX = -90px)
    // Usamos dispatchEvent con eventos táctiles estándar (Touch y TouchEvent)
    await page.evaluate(() => {
      const container = document.querySelector('div[class*="h-[100dvh]"]') || document.body;
      const startX = 260;
      const startY = 350;
      const endX = 170; // 260 - 170 = 90px de arrastre hacia la izquierda
      const endY = 350;

      const touchStart = new Touch({
        identifier: 1,
        target: container,
        clientX: startX,
        clientY: startY,
        pageX: startX,
        pageY: startY,
      });

      const touchEnd = new Touch({
        identifier: 1,
        target: container,
        clientX: endX,
        clientY: endY,
        pageX: endX,
        pageY: endY,
      });

      container.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [touchStart],
          targetTouches: [touchStart],
          changedTouches: [touchStart],
        })
      );

      container.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true,
          touches: [],
          targetTouches: [],
          changedTouches: [touchEnd],
        })
      );
    });

    // Validar que la tarjeta activa cambió a REF-002 (Conjunto Venus)
    await expect(page.locator('main').getByText('REF-002')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Conjunto Venus' })).toBeVisible();

    // Validar que el indicador de puntos expanda la 2.ª píldora
    await expect(dot2).toHaveClass(/w-6/);
    await expect(dot1).not.toHaveClass(/w-6/);
  });

  // Test E2E 3: Layout vertical sin scroll
  test('Layout vertical sin scroll: el elemento de la fila inferior (AR - Areia) es visible dentro del viewport 390x844', async ({
    page,
  }) => {
    // Localizar el elemento del último color de la cuadrícula: AR - Areia
    const areiaLabel = page.locator('span:text-is("AR")');
    const areiaName = page.locator('span:text-is("Areia")');
    const areiaRow = page.locator('div:has(> div > span:text-is("AR"))').first();

    // 1. Validar visibilidad
    await expect(areiaLabel).toBeVisible();
    await expect(areiaName).toBeVisible();

    // 2. Obtener el cuadro delimitador (BoundingBox) del elemento en la fila inferior
    const boundingBox = await areiaRow.boundingBox();
    expect(boundingBox).not.toBeNull();

    if (boundingBox) {
      const viewportHeight = 844;
      // Validar que el fondo del elemento esté dentro de la altura de la pantalla (<= 844px)
      expect(boundingBox.y + boundingBox.height).toBeLessThanOrEqual(viewportHeight);
      // Validar que esté por debajo del header
      expect(boundingBox.y).toBeGreaterThan(0);
    }

    // 3. Validar que la ventana no tenga scroll vertical acumulado
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);

    // 4. Validar que el botón de sincronización inferior también esté dentro del viewport
    const syncButton = page.locator('button:has-text("Guardar / Sincronizar")');
    await expect(syncButton).toBeVisible();
    const syncBox = await syncButton.boundingBox();
    expect(syncBox).not.toBeNull();
    if (syncBox) {
      expect(syncBox.y + syncBox.height).toBeLessThanOrEqual(844);
    }
  });
});
