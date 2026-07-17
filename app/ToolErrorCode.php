<?php

namespace App;

enum ToolErrorCode: string
{
    case ProcessingFailed = 'processing_failed';
    case ExportFailed = 'export_failed';
    case ShareFailed = 'share_failed';
    case RenderFailed = 'render_failed';
}
