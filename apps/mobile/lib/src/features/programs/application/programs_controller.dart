import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/program_dto.dart';
import '../data/programs_repository.dart';

final publicProgramsProvider = FutureProvider<List<ProgramDto>>((ref) async {
  final repo = ref.watch(programsRepositoryProvider);
  return repo.listPublicPrograms();
});

final programDetailProvider =
    FutureProvider.family<ProgramDto, String>((ref, id) async {
  final repo = ref.watch(programsRepositoryProvider);
  return repo.getById(id);
});
