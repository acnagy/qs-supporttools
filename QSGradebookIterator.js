// 
//  QSGradebookIterator.js
//  Rick Nagy (@br1ckb0t)
//  2014-06-05
// 

/**
 * Extends QSIterator
 * iterates through each Gradebook for each teacher/semester
 * 
 * @param loopFunc		the code to run in each entry after load
 */

function QSGradebookIterator(loopFunc) {
    ClassUtil.inherit(QSGradebookIterator, this, QSIterator);
    this._super(this.TEACHER_OPTIONS_SELECTOR, loopFunc);
    this.hasSeenStart = false;
}

QSGradebookIterator.prototype.TEACHER_DROPDOWN_SELECTOR = ".mainRenderArea .dropDownWidget select:eq(0)";
QSGradebookIterator.prototype.TEACHER_OPTIONS_SELECTOR = QSGradebookIterator.prototype.TEACHER_DROPDOWN_SELECTOR + " option";

QSGradebookIterator.prototype._loop = function() {
    var SEMESTER_DROPDOWN_SELECTOR = ".mainRenderArea .dropDownWidget select:eq(1)";
    var SEMESTER_OPTIONS_SELECTOR = SEMESTER_DROPDOWN_SELECTOR + " option";
    var COURSE_DROPDOWN_SELECTOR = ".mainRenderArea .dropDownWidget select:eq(2)";
    var COURSE_OPTIONS_SELECTOR = COURSE_DROPDOWN_SELECTOR +  " option";
    var courseLoopFunc = this.loopFunc.bind(this);
    this.id = "teacher";
    
    var START_TEACHER = "Rebeca";
    if (!this.hasSeenStart && !this.elem.text().match(START_TEACHER)) {
        this.next();
        return;
    } else if (this.elem.text().match(START_TEACHER)) {
        this.hasSeenStart = true;
    }
    
    // elem is a teacher in the teacher dropdown
    var teacherDropdown = $(this.TEACHER_DROPDOWN_SELECTOR);
    teacherDropdown.val(this.elem.text());
    new Notification("Starting: " + this.elem.text());
    teacherDropdown.change();
    
    this.afterLoad(function() {
        var iter = new QSIterator(SEMESTER_OPTIONS_SELECTOR, function() {
            this.id = "semester";
            var semesterDropdown = $(SEMESTER_DROPDOWN_SELECTOR);
            if (this.elem.text().match("2013/2014, Third Term")
                    || this.elem.text().match("2013/2014, Fourth Term")) {
                this.next();
                return;        
            }
            semesterDropdown.val(this.elem.text());
            semesterDropdown.change();
            this.afterLoad(function() {
                var iter = new QSIterator(COURSE_OPTIONS_SELECTOR, function() {
                    var courseDropdown = $(COURSE_DROPDOWN_SELECTOR);
                    courseDropdown.val(this.elem.text());
                    courseDropdown.change();
                    this.afterLoad(function() {
                        courseLoopFunc();
                        this.afterLoad(function() {
                            this.next();
                        });
                    });
                    this.id = "course";
                });
                this.afterChildIterator(function() {
                    this.next();
                }, iter);
            });
        });
        this.afterChildIterator(function() {
            this.next();
        }, iter);
    });
};

