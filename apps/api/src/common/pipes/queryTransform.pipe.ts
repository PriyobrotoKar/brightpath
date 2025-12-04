import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class QueryTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query') {
      if (metadata.data === 'limit') {
        return isNaN(value) || value === 0 ? 10 : parseInt(value);
      }
      if (metadata.data === 'page') {
        return isNaN(value) || value === 0 ? 0 : parseInt(value);
      }
    }
    return value;
  }
}
