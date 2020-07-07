import { SupportedRenderer } from './renderer.interface';
import { ListrRendererValue } from '../interfaces/listr.interface';
export declare function getRenderer(renderer: ListrRendererValue, fallbackRenderer?: ListrRendererValue): SupportedRenderer;
