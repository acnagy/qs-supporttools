//
//  QSGradebookIterator.js
//  Rick Nagy (@br1ckb0t)
//  2014-06-05
//

/**
 * Extends QSIterator
 * iterates through each Gradebook for each teacher/semester
 *
 * Loops through each teacher, semester, and section.
 *
 * For now, to filter on a given semester, teacher, or course, set
 *     QSGradebookIterator.*_CONTAINS
 *
 * @param loopFunc        the code to run in each entry after load
 * @param startTeacher    (optional) the teacher to start on - good for crashes
 */

function QSGradebookIterator(loopFunc, startTeacher) {
    ClassUtil.inherit(QSGradebookIterator, this, QSIterator);

    QSGradebookIterator.updateDropDowns();

    this._super(QSGradebookIterator.teacherSelector(), loopFunc);

    this.startTeacher = startTeacher;
    this.hasSeenStart = false;
}

QSGradebookIterator.TEACHER_CONTAINS = "";
QSGradebookIterator.SEMESTER_CONTAINS = "";
QSGradebookIterator.COURSE_CONTAINS = "";

QSGradebookIterator.prototype._loop = function() {
    this.id = "teacher";

    if (this.elem.text().match(this.startTeacher)) {
        this.hasSeenStart = true;
    }

    if(!this.hasSeenStart) {
        this.next();
        return;
    }

    var teacherDropdown = $(QSGradebookIterator.TEACHER_DROPDOWN_SEL);
    QSIterator.setStylizedDropdownValue(teacherDropdown, this.elem.text());

    this.afterLoad(function() {
        QSGradebookIterator.updateDropDowns();

        var semesterIteratorForTeacher = QSGradebookIterator.semesterIterator(this.loopFunc, this.elem.text());
        this.afterChildIterator(this.next, semesterIteratorForTeacher);
    });
};

QSGradebookIterator.semesterIterator = function(courseLoopFunc, currentTeacher) {
    return new QSIterator(QSGradebookIterator.semesterSelector(), function() {
        this.id = "semester";

        var semesterDropdown = $(QSGradebookIterator.SEMESTER_DROPDOWN_SEL);
        QSIterator.setStylizedDropdownValue(semesterDropdown, this.elem.text());

        this.afterLoad(function() {
            QSGradebookIterator.updateDropDowns();

            var courseIteratorForSemester = QSGradebookIterator.courseIterator(courseLoopFunc, currentTeacher, this.elem.text());
            this.afterChildIterator(this.next, courseIteratorForSemester);
        });
    });
};

QSGradebookIterator.courseIterator = function(courseLoopFunc, currentTeacher, currentSemester) {
    return new QSIterator(QSGradebookIterator.courseSelector(), function() {
        this.id = "course";
        this.currentTeacher = currentTeacher;
        this.currentSemester = currentSemester;

        var courseDropown = $(QSGradebookIterator.COURSE_DROPDOWN_SEL);
        QSIterator.setStylizedDropdownValue(courseDropown, this.elem.text());

        this.afterLoad(function() {
            QSGradebookIterator.updateDropDowns();

            courseLoopFunc.call(this);
        });
    });
};

QSGradebookIterator.teacherSelector = function() {
    return QSGradebookIterator._optionsSelector(
        QSGradebookIterator.TEACHER_OPTIONS_SEL,
        QSGradebookIterator.TEACHER_CONTAINS
    );
};

QSGradebookIterator.semesterSelector = function() {
    return QSGradebookIterator._optionsSelector(
        QSGradebookIterator.SEMESTER_OPTIONS_SEL,
        QSGradebookIterator.SEMESTER_CONTAINS
    );
};

QSGradebookIterator.courseSelector = function() {
    return QSGradebookIterator._optionsSelector(
        QSGradebookIterator.COURSE_OPTIONS_SEL,
        QSGradebookIterator.COURSE_CONTAINS
    );
};

QSGradebookIterator._optionsSelector = function(base, filter) {
    var contains = "";
    if(filter) {
        contains = ":contains(" + filter + ")"; 
    }
    return base + contains;
};

QSGradebookIterator.updateDropDowns = function() {
    $(QSGradebookIterator.TEACHER_DROPDOWN_SEL).find("table").trigger("click.dropDownActivate");
    $(QSGradebookIterator.SEMESTER_DROPDOWN_SEL).find("table").trigger("click.dropDownActivate");
    $(QSGradebookIterator.COURSE_DROPDOWN_SEL).find("table").trigger("click.dropDownActivate");
};

QSGradebookIterator.GB_DROPDOWNS_SEL = ".columnPanelWidget:contains(Teacher):contains(Semester):last";

QSGradebookIterator.TEACHER_DROPDOWN_SEL = QSGradebookIterator.GB_DROPDOWNS_SEL + " .stylizedDropDownWidget:eq(0)";
QSGradebookIterator.TEACHER_OPTIONS_SEL = QSGradebookIterator.TEACHER_DROPDOWN_SEL + " li";

QSGradebookIterator.SEMESTER_DROPDOWN_SEL = QSGradebookIterator.GB_DROPDOWNS_SEL + " .stylizedDropDownWidget:eq(1)";
QSGradebookIterator.SEMESTER_OPTIONS_SEL = QSGradebookIterator.SEMESTER_DROPDOWN_SEL + " li";

QSGradebookIterator.COURSE_DROPDOWN_SEL = QSGradebookIterator.GB_DROPDOWNS_SEL + " .stylizedDropDownWidget:eq(2)";
QSGradebookIterator.COURSE_OPTIONS_SEL = QSGradebookIterator.COURSE_DROPDOWN_SEL +  " li";
