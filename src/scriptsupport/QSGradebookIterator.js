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
 */

function QSGradebookIterator(loopFunc, argObj) {
    ClassUtil.inherit(QSGradebookIterator, this, QSIterator);

    this._super(QSGradebookIterator.teacherSelector(), loopFunc);
    this.hasSeenStart = false;
}

QSGradebookIterator.TEACHER_CONTAINS = "";
QSGradebookIterator.SEMESTER_CONTAINS = "";
QSGradebookIterator.COURSE_CONTAINS = "";

QSGradebookIterator.prototype._loop = function() {
    this.id = "teacher";

    var teacherDropdown = $(QSGradebookIterator.TEACHER_DROPDOWN_SELECTOR);
    QSIterator.setDropdownVal(teacherDropdown, this.elem.val());

    this.afterLoad(function() {
        var semesterIteratorForTeacher = QSGradebookIterator.semesterIterator(this.loopFunc);
        this.afterChildIterator(this.next, semesterIteratorForTeacher);
    });
};

QSGradebookIterator.semesterIterator = function(courseLoopFunc) {
    return new QSIterator(QSGradebookIterator.semesterSelector(), function() {
        this.id = "semester";

        var semesterDropdown = $(QSGradebookIterator.SEMESTER_DROPDOWN_SELECTOR);
        QSIterator.setDropdownVal(semesterDropdown, this.elem.val());

        this.afterLoad(function() {
            var courseIteratorForSemester = QSGradebookIterator.courseIterator(courseLoopFunc);
            this.afterChildIterator(this.next, courseIteratorForSemester);
        });
    });
};

QSGradebookIterator.courseIterator = function(courseLoopFunc) {
    return new QSIterator(QSGradebookIterator.courseSelector(), function() {
        this.id = "course";

        var courseDropown = $(QSGradebookIterator.COURSE_DROPDOWN_SELECTOR);
        QSIterator.setDropdownVal(courseDropown, this.elem.val());

        this.afterLoad(courseLoopFunc);
    });
};

QSGradebookIterator.teacherSelector = function() {
    return QSGradebookIterator._optionsSelector(
        QSGradebookIterator.TEACHER_OPTIONS_SELECTOR,
        QSGradebookIterator.TEACHER_CONTAINS
    );
};

QSGradebookIterator.semesterSelector = function() {
    return QSGradebookIterator._optionsSelector(
        QSGradebookIterator.SEMESTER_OPTIONS_SELECTOR,
        QSGradebookIterator.SEMESTER_CONTAINS
    );
};

QSGradebookIterator.courseSelector = function() {
    return QSGradebookIterator._optionsSelector(
        QSGradebookIterator.COURSE_OPTIONS_SELECTOR,
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

QSGradebookIterator.TEACHER_DROPDOWN_SELECTOR = ".mainRenderArea .dropDownWidget select:eq(0)";
QSGradebookIterator.TEACHER_OPTIONS_SELECTOR = QSGradebookIterator.TEACHER_DROPDOWN_SELECTOR + " option";
QSGradebookIterator.SEMESTER_DROPDOWN_SELECTOR = ".mainRenderArea .dropDownWidget select:eq(1)";
QSGradebookIterator.SEMESTER_OPTIONS_SELECTOR = QSGradebookIterator.SEMESTER_DROPDOWN_SELECTOR + " option";
QSGradebookIterator.COURSE_DROPDOWN_SELECTOR = ".mainRenderArea .dropDownWidget select:eq(2)";
QSGradebookIterator.COURSE_OPTIONS_SELECTOR = QSGradebookIterator.COURSE_DROPDOWN_SELECTOR +  " option";
