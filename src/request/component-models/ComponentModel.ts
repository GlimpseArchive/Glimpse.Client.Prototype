'use strict';

import { IComponentModel } from './IComponentModel';

export abstract class ComponentModel implements IComponentModel {
    public abstract init(request);
}
