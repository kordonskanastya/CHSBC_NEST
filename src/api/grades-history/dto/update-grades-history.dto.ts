import { PartialType } from '@nestjs/mapped-types';
import { CreateGradesHistoryDto } from './create-grades-history.dto';

export class UpdateGradesHistoryDto extends PartialType(CreateGradesHistoryDto) {}
