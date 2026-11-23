import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

/**
 * Reuses the active component when navigating between a list route and its
 * parameterized detail route (e.g. /spells -> /spells/fireball) so table
 * filters, sort order, and pagination stay intact.
 */
export class SameComponentReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.routeConfig === curr.routeConfig) {
      return true;
    }
    const futureLoader = future.routeConfig?.loadComponent;
    const currLoader = curr.routeConfig?.loadComponent;
    if (!futureLoader || futureLoader !== currLoader) {
      return false;
    }
    return future.routeConfig?.data?.['mode'] === curr.routeConfig?.data?.['mode'];
  }
}
