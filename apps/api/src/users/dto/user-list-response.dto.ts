import { User } from '../entities/user.entity';

export class UserListResponseDto {
  data!: User[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
