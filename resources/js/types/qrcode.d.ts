declare module 'qrcode' {
    export type QRCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

    export type QRCodeRenderOptions = {
        errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
        margin?: number;
        width?: number;
        color?: {
            dark?: string;
            light?: string;
        };
        type?: 'image/png' | 'image/jpeg' | 'image/webp';
        rendererOpts?: {
            quality?: number;
        };
    };

    export type QRCodeStringOptions = Omit<QRCodeRenderOptions, 'type'> & {
        type: 'svg';
    };

    export type QRCodeSymbol = {
        modules: {
            data: Uint8Array;
            size: number;
            get(row: number, column: number): number;
        };
        version: number;
        maskPattern: number;
    };

    type QRCodeApi = {
        create(
            text: string,
            options?: Pick<QRCodeRenderOptions, 'errorCorrectionLevel'>,
        ): QRCodeSymbol;
        toCanvas(
            canvas: HTMLCanvasElement,
            text: string,
            options?: QRCodeRenderOptions,
        ): Promise<void>;
        toDataURL(
            canvas: HTMLCanvasElement,
            text: string,
            options?: QRCodeRenderOptions,
        ): Promise<string>;
        toString(text: string, options: QRCodeStringOptions): Promise<string>;
    };

    const QRCode: QRCodeApi;

    export default QRCode;
}
