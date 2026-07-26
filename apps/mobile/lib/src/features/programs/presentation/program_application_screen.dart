import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/i18n_extension.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/error_banner.dart';
import '../application/programs_controller.dart';
import '../data/programs_repository.dart';

class ProgramApplicationScreen extends ConsumerStatefulWidget {
  const ProgramApplicationScreen({
    super.key,
    required this.programId,
  });

  final String programId;

  @override
  ConsumerState<ProgramApplicationScreen> createState() =>
      _ProgramApplicationScreenState();
}

class _ProgramApplicationScreenState
    extends ConsumerState<ProgramApplicationScreen> {
  final _formKey = GlobalKey<FormState>();

  // General & Personal
  String _mediumOfStudy = 'English';
  final _firstNameCtrl = TextEditingController();
  final _middleNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();
  String _gender = 'Male';
  String _maritalStatus = 'Single';
  final _nationalityCtrl = TextEditingController(text: 'Indian');
  final _aadhaarCtrl = TextEditingController();

  // Contact Info
  String _mobileCode = '+91';
  final _mobileCtrl = TextEditingController();
  String _whatsappCode = '+91';
  final _whatsappCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();

  // Permanent Address
  final _permAddress1Ctrl = TextEditingController();
  final _permAddress2Ctrl = TextEditingController();
  final _permCityCtrl = TextEditingController();
  final _permStateCtrl = TextEditingController();
  final _permPostalCodeCtrl = TextEditingController();
  final _permCountryCtrl = TextEditingController(text: 'India');

  // Current Address
  bool _sameAsPermanent = true;
  final _currAddress1Ctrl = TextEditingController();
  final _currAddress2Ctrl = TextEditingController();
  final _currCityCtrl = TextEditingController();
  final _currStateCtrl = TextEditingController();
  final _currPostalCodeCtrl = TextEditingController();
  final _currCountryCtrl = TextEditingController(text: 'India');

  // Academic Qualifications
  final _highestQualificationCtrl = TextEditingController();
  final _previousInstitutionCtrl = TextEditingController();
  final _yearOfCompletionCtrl = TextEditingController();
  final _marksOrGradeCtrl = TextEditingController();

  // Spiritual & Church Info
  String _isBornAgain = 'yes';
  final _churchNameCtrl = TextEditingController();
  final _churchAddress1Ctrl = TextEditingController();
  final _churchCityCtrl = TextEditingController();
  final _pastorNameCtrl = TextEditingController();
  final _ministryExperienceCtrl = TextEditingController();
  final _callingStatementCtrl = TextEditingController();

  // Reference 1
  final _ref1NameCtrl = TextEditingController();
  final _ref1EmailCtrl = TextEditingController();
  final _ref1PhoneCtrl = TextEditingController();
  final _ref1RelationCtrl = TextEditingController();

  // Reference 2
  final _ref2NameCtrl = TextEditingController();
  final _ref2EmailCtrl = TextEditingController();
  final _ref2PhoneCtrl = TextEditingController();
  final _ref2RelationCtrl = TextEditingController();

  // Declaration
  final _declFirstCtrl = TextEditingController();
  final _declLastCtrl = TextEditingController();
  bool _agreeToRules = false;

  bool _isSubmitting = false;
  bool _isSubmitted = false;
  String? _errorMessage;

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _middleNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _dobCtrl.dispose();
    _nationalityCtrl.dispose();
    _aadhaarCtrl.dispose();
    _mobileCtrl.dispose();
    _whatsappCtrl.dispose();
    _emailCtrl.dispose();

    _permAddress1Ctrl.dispose();
    _permAddress2Ctrl.dispose();
    _permCityCtrl.dispose();
    _permStateCtrl.dispose();
    _permPostalCodeCtrl.dispose();
    _permCountryCtrl.dispose();

    _currAddress1Ctrl.dispose();
    _currAddress2Ctrl.dispose();
    _currCityCtrl.dispose();
    _currStateCtrl.dispose();
    _currPostalCodeCtrl.dispose();
    _currCountryCtrl.dispose();

    _highestQualificationCtrl.dispose();
    _previousInstitutionCtrl.dispose();
    _yearOfCompletionCtrl.dispose();
    _marksOrGradeCtrl.dispose();

    _churchNameCtrl.dispose();
    _churchAddress1Ctrl.dispose();
    _churchCityCtrl.dispose();
    _pastorNameCtrl.dispose();
    _ministryExperienceCtrl.dispose();
    _callingStatementCtrl.dispose();

    _ref1NameCtrl.dispose();
    _ref1EmailCtrl.dispose();
    _ref1PhoneCtrl.dispose();
    _ref1RelationCtrl.dispose();

    _ref2NameCtrl.dispose();
    _ref2EmailCtrl.dispose();
    _ref2PhoneCtrl.dispose();
    _ref2RelationCtrl.dispose();

    _declFirstCtrl.dispose();
    _declLastCtrl.dispose();
    super.dispose();
  }

  InputDecoration _inputDeco({
    required String labelText,
    String? hintText,
    IconData? prefixIcon,
  }) {
    return InputDecoration(
      labelText: labelText,
      hintText: hintText,
      prefixIcon: prefixIcon != null ? Icon(prefixIcon, size: 20) : null,
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFC59A45), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red),
      ),
    );
  }

  Future<void> _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreeToRules) {
      setState(() => _errorMessage =
          context.tr('mobile.application.acceptDeclaration'),);
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final fullName = '${_firstNameCtrl.text.trim()} ${_middleNameCtrl.text.trim()} ${_lastNameCtrl.text.trim()}'
          .replaceAll(RegExp(r'\s+'), ' ')
          .trim();

      final declarationName =
          '${_declFirstCtrl.text.trim()} ${_declLastCtrl.text.trim()}'.trim();

      final currLine1 = _sameAsPermanent ? _permAddress1Ctrl.text : _currAddress1Ctrl.text;
      final currLine2 = _sameAsPermanent ? _permAddress2Ctrl.text : _currAddress2Ctrl.text;
      final currCity = _sameAsPermanent ? _permCityCtrl.text : _currCityCtrl.text;
      final currState = _sameAsPermanent ? _permStateCtrl.text : _currStateCtrl.text;
      final currPostal = _sameAsPermanent ? _permPostalCodeCtrl.text : _currPostalCodeCtrl.text;
      final currCountry = _sameAsPermanent ? _permCountryCtrl.text : _currCountryCtrl.text;

      final repo = ref.read(programsRepositoryProvider);
      await repo.applyForProgram(widget.programId, {
        'mediumOfStudy': _mediumOfStudy,
        'fullName': fullName,
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim(),
        'dob': _dobCtrl.text.trim(),
        'gender': _gender,
        'maritalStatus': _maritalStatus,
        'nationality': _nationalityCtrl.text.trim(),
        'aadhaarNumber': _aadhaarCtrl.text.trim(),
        'mobileNumber': '$_mobileCode ${_mobileCtrl.text.trim()}',
        'whatsappNumber': '$_whatsappCode ${_whatsappCtrl.text.trim()}',
        'email': _emailCtrl.text.trim(),

        'permanentAddressLine1': _permAddress1Ctrl.text.trim(),
        'permanentAddressLine2': _permAddress2Ctrl.text.trim(),
        'permanentCity': _permCityCtrl.text.trim(),
        'permanentState': _permStateCtrl.text.trim(),
        'permanentPostalCode': _permPostalCodeCtrl.text.trim(),
        'permanentCountry': _permCountryCtrl.text.trim(),

        'currentAddressLine1': currLine1.trim(),
        'currentAddressLine2': currLine2.trim(),
        'currentCity': currCity.trim(),
        'currentState': currState.trim(),
        'currentPostalCode': currPostal.trim(),
        'currentCountry': currCountry.trim(),

        'highestQualification': _highestQualificationCtrl.text.trim(),
        'previousInstitution': _previousInstitutionCtrl.text.trim(),
        'yearOfCompletion': _yearOfCompletionCtrl.text.trim(),
        'marksOrGrade': _marksOrGradeCtrl.text.trim(),

        'isBornAgain': _isBornAgain,
        'churchName': _churchNameCtrl.text.trim(),
        'churchAddressLine1': _churchAddress1Ctrl.text.trim(),
        'churchCity': _churchCityCtrl.text.trim(),
        'pastorName': _pastorNameCtrl.text.trim(),
        'ministryExperience': _ministryExperienceCtrl.text.trim(),
        'callingStatement': _callingStatementCtrl.text.trim(),

        'reference1Name': _ref1NameCtrl.text.trim(),
        'reference1Email': _ref1EmailCtrl.text.trim(),
        'reference1Phone': _ref1PhoneCtrl.text.trim(),
        'reference1Relation': _ref1RelationCtrl.text.trim(),
        'reference1Type': 'Pastor Reference',

        'reference2Name': _ref2NameCtrl.text.trim(),
        'reference2Email': _ref2EmailCtrl.text.trim(),
        'reference2Phone': _ref2PhoneCtrl.text.trim(),
        'reference2Relation': _ref2RelationCtrl.text.trim(),
        'reference2Type': 'General Reference',

        'declarationName': declarationName,
        'agreeToRules': true,
      });

      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _isSubmitted = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage = e.toString().replaceAll('ApiException: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final programAsync = ref.watch(programDetailProvider(widget.programId));

    if (_isSubmitted) {
      return Scaffold(
        appBar: AppBar(
          title: Text(context.tr('mobile.application.submittedTitle'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFF142417),
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF16A34A),
                  size: 72,
                ),
                const SizedBox(height: 16),
                Text(
                  context.tr('mobile.application.submittedHeading'),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colors.forestDeep,
                      ),
                ),
                const SizedBox(height: 12),
                Text(
                  context.tr('mobile.application.submittedMessage'),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: colors.textSecondary, height: 1.5),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => context.go(AppRoutes.courses),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.goldPrimary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 32, vertical: 14,),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    context.tr('mobile.application.returnExplore'),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF142417),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          context.tr('mobile.application.title'),
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Program Banner Card
              programAsync.when(
                data: (prog) => Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: colors.forestGradient,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: colors.goldPrimary.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          context.tr('mobile.application.applyingFor'),
                          style: TextStyle(
                            color: colors.goldLight,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        prog.title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          height: 1.25,
                        ),
                      ),
                    ],
                  ),
                ),
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 20),

              if (_errorMessage != null) ...[
                ErrorBanner(message: _errorMessage!),
                const SizedBox(height: 16),
              ],

              // Card Section: 1. Personal Details
              _buildCardSection(
                title: context.tr('mobile.application.section1'),
                icon: Icons.person_rounded,
                colors: colors,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _mediumOfStudy,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.mediumOfStudy'), prefixIcon: Icons.language_rounded),
                    items: [
                      DropdownMenuItem(value: 'English', child: Text(context.tr('mobile.languages.en'))),
                      DropdownMenuItem(value: 'Hindi', child: Text(context.tr('mobile.languages.hi'))),
                      DropdownMenuItem(value: 'Tamil', child: Text(context.tr('mobile.languages.ta'))),
                    ],
                    onChanged: (v) => setState(() => _mediumOfStudy = v ?? 'English'),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _firstNameCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.firstName')),
                    validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _middleNameCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.middleName')),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _lastNameCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.lastName')),
                    validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _dobCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.dob')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _gender,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.gender')),
                          items: [
                            DropdownMenuItem(value: 'Male', child: Text(context.tr('mobile.application.male'))),
                            DropdownMenuItem(value: 'Female', child: Text(context.tr('mobile.application.female'))),
                          ],
                          onChanged: (v) => setState(() => _gender = v ?? 'Male'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _maritalStatus,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.maritalStatus')),
                          items: [
                            DropdownMenuItem(value: 'Single', child: Text(context.tr('mobile.application.single'))),
                            DropdownMenuItem(value: 'Married', child: Text(context.tr('mobile.application.married'))),
                          ],
                          onChanged: (v) => setState(() => _maritalStatus = v ?? 'Single'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _nationalityCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.nationality')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _aadhaarCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.aadhaar')),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: Contact Information
              _buildCardSection(
                title: context.tr('mobile.application.sectionContact'),
                icon: Icons.alternate_email_rounded,
                colors: colors,
                children: [
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.emailAddress'), prefixIcon: Icons.email_outlined),
                    validator: (v) => v == null || !v.contains('@') ? context.tr('mobile.application.validEmail') : null,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Container(
                        width: 105,
                        margin: const EdgeInsets.only(right: 10),
                        child: DropdownButtonFormField<String>(
                          initialValue: _mobileCode,
                          isExpanded: true,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.code')),
                          items: const [
                            DropdownMenuItem(value: '+91', child: Text('+91')),
                            DropdownMenuItem(value: '+971', child: Text('+971')),
                            DropdownMenuItem(value: '+1', child: Text('+1')),
                          ],
                          onChanged: (v) => setState(() => _mobileCode = v ?? '+91'),
                        ),
                      ),
                      Expanded(
                        child: TextFormField(
                          controller: _mobileCtrl,
                          keyboardType: TextInputType.phone,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.mobilePhone'), prefixIcon: Icons.phone_android_rounded),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Container(
                        width: 105,
                        margin: const EdgeInsets.only(right: 10),
                        child: DropdownButtonFormField<String>(
                          initialValue: _whatsappCode,
                          isExpanded: true,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.code')),
                          items: const [
                            DropdownMenuItem(value: '+91', child: Text('+91')),
                            DropdownMenuItem(value: '+971', child: Text('+971')),
                            DropdownMenuItem(value: '+1', child: Text('+1')),
                          ],
                          onChanged: (v) => setState(() => _whatsappCode = v ?? '+91'),
                        ),
                      ),
                      Expanded(
                        child: TextFormField(
                          controller: _whatsappCtrl,
                          keyboardType: TextInputType.phone,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.whatsapp'), prefixIcon: Icons.chat_rounded),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: Address Details
              _buildCardSection(
                title: context.tr('mobile.application.sectionPermAddress'),
                icon: Icons.location_on_rounded,
                colors: colors,
                children: [
                  TextFormField(
                    controller: _permAddress1Ctrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.address1')),
                    validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _permAddress2Ctrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.address2')),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _permCityCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.city')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _permStateCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.state')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _permPostalCodeCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.postalCode')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _permCountryCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.country')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  InkWell(
                    onTap: () => setState(() => _sameAsPermanent = !_sameAsPermanent),
                    child: Row(
                      children: [
                        Checkbox(
                          value: _sameAsPermanent,
                          activeColor: colors.goldDark,
                          onChanged: (v) => setState(() => _sameAsPermanent = v ?? true),
                        ),
                        Expanded(
                          child: Text(
                            context.tr('mobile.application.sameAddress'),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: 2. Educational Qualifications
              _buildCardSection(
                title: context.tr('mobile.application.section2'),
                icon: Icons.school_rounded,
                colors: colors,
                children: [
                  TextFormField(
                    controller: _highestQualificationCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.highestQual')),
                    validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _previousInstitutionCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.prevInstitution')),
                    validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _yearOfCompletionCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.yearCompletion')),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _marksOrGradeCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.marksGrade')),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: 3. Church & Spiritual Info
              _buildCardSection(
                title: context.tr('mobile.application.section3'),
                icon: Icons.church_rounded,
                colors: colors,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _isBornAgain,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.bornAgain')),
                    items: [
                      DropdownMenuItem(value: 'yes', child: Text(context.tr('mobile.application.yes'))),
                      DropdownMenuItem(value: 'no', child: Text(context.tr('mobile.application.no'))),
                    ],
                    onChanged: (v) => setState(() => _isBornAgain = v ?? 'yes'),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _churchNameCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.churchName')),
                    validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _churchCityCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.churchCity')),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _pastorNameCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.pastorName')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _ministryExperienceCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.ministryExp')),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _callingStatementCtrl,
                    maxLines: 3,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.callingStatement')),
                    validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: 4. References
              _buildCardSection(
                title: context.tr('mobile.application.section4'),
                icon: Icons.group_rounded,
                colors: colors,
                children: [
                  Text(
                    context.tr('mobile.application.ref1'),
                    style: TextStyle(fontWeight: FontWeight.bold, color: colors.goldDark, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _ref1NameCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.fullName')),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _ref1EmailCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.email')),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _ref1PhoneCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.phone')),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Text(
                    context.tr('mobile.application.ref2'),
                    style: TextStyle(fontWeight: FontWeight.bold, color: colors.goldDark, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _ref2NameCtrl,
                    decoration: _inputDeco(labelText: context.tr('mobile.application.fullName')),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _ref2EmailCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.email')),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _ref2PhoneCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.phone')),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: 5. Declaration & Rules
              _buildCardSection(
                title: context.tr('mobile.application.section5'),
                icon: Icons.verified_user_rounded,
                colors: colors,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _declFirstCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.firstName')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _declLastCtrl,
                          decoration: _inputDeco(labelText: context.tr('mobile.application.lastName')),
                          validator: (v) => v == null || v.isEmpty ? context.tr('mobile.application.required') : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () => setState(() => _agreeToRules = !_agreeToRules),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: _agreeToRules,
                          activeColor: colors.goldDark,
                          onChanged: (v) => setState(() => _agreeToRules = v ?? false),
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 10),
                            child: Text(
                              context.tr('mobile.application.declaration'),
                              style: const TextStyle(fontSize: 13, height: 1.4, color: Color(0xFF334155)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Submit Button
              ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _submitApplication,
                icon: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const Icon(Icons.send_rounded, size: 20),
                label: Text(
                  _isSubmitting ? context.tr('mobile.application.submitting') : context.tr('mobile.application.submit'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.goldPrimary,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCardSection({
    required String title,
    required IconData icon,
    required AppColors colors,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: colors.goldDark, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }
}
