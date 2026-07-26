import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
          'Please accept the declaration & rules before submitting.',);
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
          title: const Text('Application Submitted', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
                  'Application Submitted!',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colors.forestDeep,
                      ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Thank you for applying to CWAY Academy. Our admissions team will review your application and send an update to your email.',
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
                  child: const Text(
                    'Return to Explore',
                    style: TextStyle(fontWeight: FontWeight.bold),
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
        title: const Text(
          'Program Application',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
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
                          'APPLYING FOR PROGRAM',
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
                title: '1. Personal Details',
                icon: Icons.person_rounded,
                colors: colors,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _mediumOfStudy,
                    decoration: _inputDeco(labelText: 'Medium of Study *', prefixIcon: Icons.language_rounded),
                    items: const [
                      DropdownMenuItem(value: 'English', child: Text('English')),
                      DropdownMenuItem(value: 'Hindi', child: Text('Hindi')),
                      DropdownMenuItem(value: 'Tamil', child: Text('Tamil')),
                    ],
                    onChanged: (v) => setState(() => _mediumOfStudy = v ?? 'English'),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _firstNameCtrl,
                    decoration: _inputDeco(labelText: 'First Name *'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _middleNameCtrl,
                    decoration: _inputDeco(labelText: 'Middle Name'),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _lastNameCtrl,
                    decoration: _inputDeco(labelText: 'Last Name *'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _dobCtrl,
                          decoration: _inputDeco(labelText: 'DOB (YYYY-MM-DD) *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _gender,
                          decoration: _inputDeco(labelText: 'Gender *'),
                          items: const [
                            DropdownMenuItem(value: 'Male', child: Text('Male')),
                            DropdownMenuItem(value: 'Female', child: Text('Female')),
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
                          decoration: _inputDeco(labelText: 'Marital Status *'),
                          items: const [
                            DropdownMenuItem(value: 'Single', child: Text('Single')),
                            DropdownMenuItem(value: 'Married', child: Text('Married')),
                          ],
                          onChanged: (v) => setState(() => _maritalStatus = v ?? 'Single'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _nationalityCtrl,
                          decoration: _inputDeco(labelText: 'Nationality *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _aadhaarCtrl,
                    decoration: _inputDeco(labelText: 'Aadhaar / National ID Number'),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: Contact Information
              _buildCardSection(
                title: 'Contact Information',
                icon: Icons.alternate_email_rounded,
                colors: colors,
                children: [
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: _inputDeco(labelText: 'Email Address *', prefixIcon: Icons.email_outlined),
                    validator: (v) => v == null || !v.contains('@') ? 'Valid email required' : null,
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
                          decoration: _inputDeco(labelText: 'Code'),
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
                          decoration: _inputDeco(labelText: 'Mobile Phone *', prefixIcon: Icons.phone_android_rounded),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
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
                          decoration: _inputDeco(labelText: 'Code'),
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
                          decoration: _inputDeco(labelText: 'WhatsApp Number', prefixIcon: Icons.chat_rounded),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: Address Details
              _buildCardSection(
                title: 'Permanent Address',
                icon: Icons.location_on_rounded,
                colors: colors,
                children: [
                  TextFormField(
                    controller: _permAddress1Ctrl,
                    decoration: _inputDeco(labelText: 'Address Line 1 *'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _permAddress2Ctrl,
                    decoration: _inputDeco(labelText: 'Address Line 2'),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _permCityCtrl,
                          decoration: _inputDeco(labelText: 'City *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _permStateCtrl,
                          decoration: _inputDeco(labelText: 'State *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
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
                          decoration: _inputDeco(labelText: 'Postal Code *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _permCountryCtrl,
                          decoration: _inputDeco(labelText: 'Country *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
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
                        const Expanded(
                          child: Text(
                            'Current Address same as Permanent Address',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
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
                title: '2. Educational Qualifications',
                icon: Icons.school_rounded,
                colors: colors,
                children: [
                  TextFormField(
                    controller: _highestQualificationCtrl,
                    decoration: _inputDeco(labelText: 'Highest Qualification (e.g. Bachelor) *'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _previousInstitutionCtrl,
                    decoration: _inputDeco(labelText: 'Previous School / University *'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _yearOfCompletionCtrl,
                          decoration: _inputDeco(labelText: 'Year of Completion'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _marksOrGradeCtrl,
                          decoration: _inputDeco(labelText: 'Marks / Grade'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: 3. Church & Spiritual Info
              _buildCardSection(
                title: '3. Church & Spiritual Details',
                icon: Icons.church_rounded,
                colors: colors,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _isBornAgain,
                    decoration: _inputDeco(labelText: 'Are you a Born Again Christian? *'),
                    items: const [
                      DropdownMenuItem(value: 'yes', child: Text('Yes')),
                      DropdownMenuItem(value: 'no', child: Text('No')),
                    ],
                    onChanged: (v) => setState(() => _isBornAgain = v ?? 'yes'),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _churchNameCtrl,
                    decoration: _inputDeco(labelText: 'Current Church Name *'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _churchCityCtrl,
                          decoration: _inputDeco(labelText: 'Church City'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _pastorNameCtrl,
                          decoration: _inputDeco(labelText: "Pastor's Name *"),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _ministryExperienceCtrl,
                    decoration: _inputDeco(labelText: 'Ministry Experience (Years / Role)'),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _callingStatementCtrl,
                    maxLines: 3,
                    decoration: _inputDeco(labelText: 'Ministry Calling Statement / Purpose *'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: 4. References
              _buildCardSection(
                title: '4. References',
                icon: Icons.group_rounded,
                colors: colors,
                children: [
                  Text(
                    'Reference 1 (Pastor / Minister)',
                    style: TextStyle(fontWeight: FontWeight.bold, color: colors.goldDark, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _ref1NameCtrl,
                    decoration: _inputDeco(labelText: 'Full Name'),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _ref1EmailCtrl,
                          decoration: _inputDeco(labelText: 'Email'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _ref1PhoneCtrl,
                          decoration: _inputDeco(labelText: 'Phone'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Reference 2 (General / Teacher)',
                    style: TextStyle(fontWeight: FontWeight.bold, color: colors.goldDark, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _ref2NameCtrl,
                    decoration: _inputDeco(labelText: 'Full Name'),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _ref2EmailCtrl,
                          decoration: _inputDeco(labelText: 'Email'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _ref2PhoneCtrl,
                          decoration: _inputDeco(labelText: 'Phone'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Card Section: 5. Declaration & Rules
              _buildCardSection(
                title: '5. Declaration & Rules',
                icon: Icons.verified_user_rounded,
                colors: colors,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _declFirstCtrl,
                          decoration: _inputDeco(labelText: 'First Name *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: _declLastCtrl,
                          decoration: _inputDeco(labelText: 'Last Name *'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
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
                        const Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(top: 10),
                            child: Text(
                              'I declare that all information provided is accurate and I agree to abide by the rules of CWAY Academy.',
                              style: TextStyle(fontSize: 13, height: 1.4, color: Color(0xFF334155)),
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
                  _isSubmitting ? 'Submitting...' : 'Submit Application',
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
