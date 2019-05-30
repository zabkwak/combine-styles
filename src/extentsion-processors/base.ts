export default abstract class BaseExtensionProcessor {

    public abstract process(src: string, dest: string): Promise<void>;
}