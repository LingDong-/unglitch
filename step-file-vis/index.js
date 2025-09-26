/*global describe THREE d3*/

let txt = `\
ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('CATIA V5 STEP Exchange'),'2;1');

FILE_NAME('D:\\Academic\\Papers\\03 Distributed LAYMOD\\Case Study\\Part1.stp','2012-03-09T18:38:05+00:00',('none'),('none'),'CATIA Version 5 Release 16 (IN-10)','CATIA V5 STEP AP203','none');

FILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));

ENDSEC;
/* file written by CATIA V5R16 */
DATA;
#5=PRODUCT('Part1','','',(#2)) ;
#1=APPLICATION_CONTEXT('configuration controlled 3D design of mechanical parts and assemblies') ;
#14=PRODUCT_DEFINITION(' ',' ',#6,#3) ;
#16=SECURITY_CLASSIFICATION(' ',' ',#15) ;
#15=SECURITY_CLASSIFICATION_LEVEL('unclassified') ;
#47=CARTESIAN_POINT(' ',(0.,0.,0.)) ;
#52=CARTESIAN_POINT('Axis2P3D Location',(0.,40.,40.)) ;
#57=CARTESIAN_POINT('Line Origine',(40.,40.,45.)) ;
#61=CARTESIAN_POINT('Vertex',(40.,40.,40.)) ;
#63=CARTESIAN_POINT('Vertex',(40.,40.,50.)) ;
#66=CARTESIAN_POINT('Line Origine',(20.,40.,40.)) ;
#70=CARTESIAN_POINT('Vertex',(0.,40.,40.)) ;
#73=CARTESIAN_POINT('Line Origine',(0.,40.,45.)) ;
#77=CARTESIAN_POINT('Vertex',(0.,40.,50.)) ;
#80=CARTESIAN_POINT('Line Origine',(20.,40.,50.)) ;
#92=CARTESIAN_POINT('Axis2P3D Location',(40.,0.,40.)) ;
#97=CARTESIAN_POINT('Line Origine',(40.,0.,45.)) ;
#101=CARTESIAN_POINT('Vertex',(40.,0.,40.)) ;
#103=CARTESIAN_POINT('Vertex',(40.,0.,50.)) ;
#106=CARTESIAN_POINT('Line Origine',(40.,20.,40.)) ;
#111=CARTESIAN_POINT('Line Origine',(40.,20.,50.)) ;
#123=CARTESIAN_POINT('Axis2P3D Location',(60.,40.,40.)) ;
#128=CARTESIAN_POINT('Line Origine',(60.,40.,45.)) ;
#132=CARTESIAN_POINT('Vertex',(60.,40.,40.)) ;
#134=CARTESIAN_POINT('Vertex',(60.,40.,50.)) ;
#137=CARTESIAN_POINT('Line Origine',(60.,20.,40.)) ;
#141=CARTESIAN_POINT('Vertex',(60.,0.,40.)) ;
#144=CARTESIAN_POINT('Line Origine',(60.,0.,45.)) ;
#148=CARTESIAN_POINT('Vertex',(60.,0.,50.)) ;
#151=CARTESIAN_POINT('Line Origine',(60.,20.,50.)) ;
#163=CARTESIAN_POINT('Line Origine',(100.,40.,45.)) ;
#167=CARTESIAN_POINT('Vertex',(100.,40.,40.)) ;
#169=CARTESIAN_POINT('Vertex',(100.,40.,50.)) ;
#172=CARTESIAN_POINT('Line Origine',(80.,40.,40.)) ;
#177=CARTESIAN_POINT('Line Origine',(80.,40.,50.)) ;
#189=CARTESIAN_POINT('Axis2P3D Location',(0.,0.,40.)) ;
#194=CARTESIAN_POINT('Line Origine',(100.,45.,40.)) ;
#198=CARTESIAN_POINT('Vertex',(100.,50.,40.)) ;
#201=CARTESIAN_POINT('Line Origine',(50.,50.,40.)) ;
#205=CARTESIAN_POINT('Vertex',(0.,50.,40.)) ;
#208=CARTESIAN_POINT('Line Origine',(0.,45.,40.)) ;
#213=CARTESIAN_POINT('Line Origine',(50.,0.,40.)) ;
#229=CARTESIAN_POINT('Axis2P3D Location',(100.,50.,0.)) ;
#234=CARTESIAN_POINT('Line Origine',(100.,50.,20.)) ;
#238=CARTESIAN_POINT('Vertex',(100.,50.,0.)) ;
#241=CARTESIAN_POINT('Line Origine',(50.,50.,0.)) ;
#245=CARTESIAN_POINT('Vertex',(0.,50.,0.)) ;
#248=CARTESIAN_POINT('Line Origine',(0.,50.,20.)) ;
#260=CARTESIAN_POINT('Axis2P3D Location',(0.,0.,0.)) ;
#265=CARTESIAN_POINT('Line Origine',(20.,0.,50.)) ;
#269=CARTESIAN_POINT('Vertex',(0.,0.,50.)) ;
#272=CARTESIAN_POINT('Line Origine',(0.,0.,25.)) ;
#276=CARTESIAN_POINT('Vertex',(0.,0.,0.)) ;
#279=CARTESIAN_POINT('Line Origine',(50.,0.,0.)) ;
#283=CARTESIAN_POINT('Vertex',(100.,0.,0.)) ;
#286=CARTESIAN_POINT('Line Origine',(100.,0.,25.)) ;
#290=CARTESIAN_POINT('Vertex',(100.,0.,50.)) ;
#293=CARTESIAN_POINT('Line Origine',(80.,0.,50.)) ;
#309=CARTESIAN_POINT('Axis2P3D Location',(100.,0.,0.)) ;
#314=CARTESIAN_POINT('Line Origine',(100.,25.,0.)) ;
#319=CARTESIAN_POINT('Line Origine',(100.,20.,50.)) ;
#333=CARTESIAN_POINT('Axis2P3D Location',(0.,50.,0.)) ;
#338=CARTESIAN_POINT('Line Origine',(0.,25.,0.)) ;
#343=CARTESIAN_POINT('Line Origine',(0.,20.,50.)) ;
#357=CARTESIAN_POINT('Axis2P3D Location',(0.,0.,0.)) ;
#369=CARTESIAN_POINT('Axis2P3D Location',(0.,0.,50.)) ;
#380=CARTESIAN_POINT('Axis2P3D Location',(80.,20.,50.)) ;
#384=CARTESIAN_POINT('Vertex',(90.,20.,50.)) ;
#386=CARTESIAN_POINT('Vertex',(70.,20.,50.)) ;
#389=CARTESIAN_POINT('Axis2P3D Location',(80.,20.,50.)) ;
#405=CARTESIAN_POINT('Axis2P3D Location',(20.,20.,50.)) ;
#409=CARTESIAN_POINT('Vertex',(30.,20.,50.)) ;
#411=CARTESIAN_POINT('Vertex',(10.,20.,50.)) ;
#414=CARTESIAN_POINT('Axis2P3D Location',(20.,20.,50.)) ;
#424=CARTESIAN_POINT('Axis2P3D Location',(20.,20.,45.)) ;
#429=CARTESIAN_POINT('Line Origine',(30.,20.,45.)) ;
#433=CARTESIAN_POINT('Vertex',(30.,20.,40.)) ;
#436=CARTESIAN_POINT('Line Origine',(10.,20.,45.)) ;
#440=CARTESIAN_POINT('Vertex',(10.,20.,40.)) ;
#443=CARTESIAN_POINT('Axis2P3D Location',(20.,20.,40.)) ;
#455=CARTESIAN_POINT('Axis2P3D Location',(20.,20.,40.)) ;
#472=CARTESIAN_POINT('Axis2P3D Location',(80.,20.,45.)) ;
#477=CARTESIAN_POINT('Line Origine',(90.,20.,45.)) ;
#481=CARTESIAN_POINT('Vertex',(90.,20.,40.)) ;
#484=CARTESIAN_POINT('Line Origine',(70.,20.,45.)) ;
#488=CARTESIAN_POINT('Vertex',(70.,20.,40.)) ;
#491=CARTESIAN_POINT('Axis2P3D Location',(80.,20.,40.)) ;
#503=CARTESIAN_POINT('Axis2P3D Location',(80.,20.,40.)) ;
#53=DIRECTION('Axis2P3D Direction',(0.,-1.,0.)) ;
#54=DIRECTION('Axis2P3D XDirection',(1.,0.,0.)) ;
#58=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#67=DIRECTION('Vector Direction',(1.,0.,0.)) ;
#74=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#81=DIRECTION('Vector Direction',(1.,0.,0.)) ;
#93=DIRECTION('Axis2P3D Direction',(1.,0.,0.)) ;
#94=DIRECTION('Axis2P3D XDirection',(0.,1.,0.)) ;
#98=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#107=DIRECTION('Vector Direction',(0.,1.,0.)) ;
#112=DIRECTION('Vector Direction',(0.,1.,0.)) ;
#124=DIRECTION('Axis2P3D Direction',(-1.,0.,0.)) ;
#125=DIRECTION('Axis2P3D XDirection',(0.,-1.,0.)) ;
#129=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#138=DIRECTION('Vector Direction',(0.,-1.,0.)) ;
#145=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#152=DIRECTION('Vector Direction',(0.,-1.,0.)) ;
#164=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#173=DIRECTION('Vector Direction',(1.,0.,0.)) ;
#178=DIRECTION('Vector Direction',(1.,0.,0.)) ;
#190=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#191=DIRECTION('Axis2P3D XDirection',(1.,0.,0.)) ;
#195=DIRECTION('Vector Direction',(0.,1.,0.)) ;
#202=DIRECTION('Vector Direction',(-1.,0.,0.)) ;
#209=DIRECTION('Vector Direction',(0.,-1.,0.)) ;
#214=DIRECTION('Vector Direction',(1.,0.,0.)) ;
#230=DIRECTION('Axis2P3D Direction',(0.,1.,0.)) ;
#231=DIRECTION('Axis2P3D XDirection',(-1.,0.,0.)) ;
#235=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#242=DIRECTION('Vector Direction',(-1.,0.,0.)) ;
#249=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#261=DIRECTION('Axis2P3D Direction',(0.,-1.,0.)) ;
#262=DIRECTION('Axis2P3D XDirection',(1.,0.,0.)) ;
#266=DIRECTION('Vector Direction',(-1.,0.,0.)) ;
#273=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#280=DIRECTION('Vector Direction',(1.,0.,0.)) ;
#287=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#294=DIRECTION('Vector Direction',(-1.,0.,0.)) ;
#310=DIRECTION('Axis2P3D Direction',(1.,0.,0.)) ;
#311=DIRECTION('Axis2P3D XDirection',(0.,1.,0.)) ;
#315=DIRECTION('Vector Direction',(0.,1.,0.)) ;
#320=DIRECTION('Vector Direction',(0.,1.,0.)) ;
#334=DIRECTION('Axis2P3D Direction',(-1.,0.,0.)) ;
#335=DIRECTION('Axis2P3D XDirection',(0.,-1.,0.)) ;
#339=DIRECTION('Vector Direction',(0.,-1.,0.)) ;
#344=DIRECTION('Vector Direction',(0.,-1.,0.)) ;
#358=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#359=DIRECTION('Axis2P3D XDirection',(1.,0.,0.)) ;
#370=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#371=DIRECTION('Axis2P3D XDirection',(1.,0.,0.)) ;
#381=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#390=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#406=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#415=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#425=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#426=DIRECTION('Axis2P3D XDirection',(1.,0.,0.)) ;
#430=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#437=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#444=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#456=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#473=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#474=DIRECTION('Axis2P3D XDirection',(1.,0.,0.)) ;
#478=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#485=DIRECTION('Vector Direction',(0.,0.,1.)) ;
#492=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#504=DIRECTION('Axis2P3D Direction',(0.,0.,1.)) ;
#48=AXIS2_PLACEMENT_3D(' ',#47,$,$) ;
#55=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#52,#53,#54) ;
#95=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#92,#93,#94) ;
#126=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#123,#124,#125) ;
#192=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#189,#190,#191) ;
#232=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#229,#230,#231) ;
#263=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#260,#261,#262) ;
#312=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#309,#310,#311) ;
#336=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#333,#334,#335) ;
#360=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#357,#358,#359) ;
#372=AXIS2_PLACEMENT_3D('Plane Axis2P3D',#369,#370,#371) ;
#382=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#380,#381,$) ;
#391=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#389,#390,$) ;
#407=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#405,#406,$) ;
#416=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#414,#415,$) ;
#427=AXIS2_PLACEMENT_3D('Cylinder Axis2P3D',#424,#425,#426) ;
#445=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#443,#444,$) ;
#457=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#455,#456,$) ;
#475=AXIS2_PLACEMENT_3D('Cylinder Axis2P3D',#472,#473,#474) ;
#493=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#491,#492,$) ;
#505=AXIS2_PLACEMENT_3D('Circle Axis2P3D',#503,#504,$) ;
#40=PRODUCT_DEFINITION_SHAPE(' ',' ',#14) ;
#31=APPROVAL_PERSON_ORGANIZATION(#25,#21,#19) ;
#25=PERSON_AND_ORGANIZATION(#22,#23) ;
#22=PERSON(' ',' ',' ',$,$,$) ;
#23=ORGANIZATION(' ',' ',' ') ;
#21=APPROVAL(#20,' ') ;
#20=APPROVAL_STATUS('not_yet_approved') ;
#19=APPROVAL_ROLE('APPROVER') ;
#13=DATE_AND_TIME(#11,#12) ;
#12=LOCAL_TIME(22,8,5.,#10) ;
#10=COORDINATED_UNIVERSAL_TIME_OFFSET(0,0,.AHEAD.) ;
#86=ORIENTED_EDGE('',*,*,#65,.F.) ;
#87=ORIENTED_EDGE('',*,*,#72,.T.) ;
#88=ORIENTED_EDGE('',*,*,#79,.T.) ;
#89=ORIENTED_EDGE('',*,*,#84,.F.) ;
#117=ORIENTED_EDGE('',*,*,#105,.F.) ;
#118=ORIENTED_EDGE('',*,*,#110,.T.) ;
#119=ORIENTED_EDGE('',*,*,#65,.T.) ;
#120=ORIENTED_EDGE('',*,*,#115,.F.) ;
#157=ORIENTED_EDGE('',*,*,#136,.F.) ;
#158=ORIENTED_EDGE('',*,*,#143,.T.) ;
#159=ORIENTED_EDGE('',*,*,#150,.T.) ;
#160=ORIENTED_EDGE('',*,*,#155,.F.) ;
#183=ORIENTED_EDGE('',*,*,#171,.F.) ;
#184=ORIENTED_EDGE('',*,*,#176,.T.) ;
#185=ORIENTED_EDGE('',*,*,#136,.T.) ;
#186=ORIENTED_EDGE('',*,*,#181,.F.) ;
#219=ORIENTED_EDGE('',*,*,#143,.F.) ;
#220=ORIENTED_EDGE('',*,*,#176,.F.) ;
#221=ORIENTED_EDGE('',*,*,#200,.T.) ;
#222=ORIENTED_EDGE('',*,*,#207,.T.) ;
#223=ORIENTED_EDGE('',*,*,#212,.T.) ;
#224=ORIENTED_EDGE('',*,*,#72,.F.) ;
#225=ORIENTED_EDGE('',*,*,#110,.F.) ;
#226=ORIENTED_EDGE('',*,*,#217,.T.) ;
#254=ORIENTED_EDGE('',*,*,#240,.F.) ;
#255=ORIENTED_EDGE('',*,*,#247,.T.) ;
#256=ORIENTED_EDGE('',*,*,#252,.T.) ;
#257=ORIENTED_EDGE('',*,*,#207,.F.) ;
#299=ORIENTED_EDGE('',*,*,#150,.F.) ;
#300=ORIENTED_EDGE('',*,*,#217,.F.) ;
#301=ORIENTED_EDGE('',*,*,#105,.T.) ;
#302=ORIENTED_EDGE('',*,*,#271,.F.) ;
#303=ORIENTED_EDGE('',*,*,#278,.F.) ;
#304=ORIENTED_EDGE('',*,*,#285,.T.) ;
#305=ORIENTED_EDGE('',*,*,#292,.T.) ;
#306=ORIENTED_EDGE('',*,*,#297,.F.) ;
#325=ORIENTED_EDGE('',*,*,#292,.F.) ;
#326=ORIENTED_EDGE('',*,*,#318,.T.) ;
#327=ORIENTED_EDGE('',*,*,#240,.T.) ;
#328=ORIENTED_EDGE('',*,*,#200,.F.) ;
#329=ORIENTED_EDGE('',*,*,#171,.T.) ;
#330=ORIENTED_EDGE('',*,*,#323,.F.) ;
#349=ORIENTED_EDGE('',*,*,#79,.F.) ;
#350=ORIENTED_EDGE('',*,*,#212,.F.) ;
#351=ORIENTED_EDGE('',*,*,#252,.F.) ;
#352=ORIENTED_EDGE('',*,*,#342,.T.) ;
#353=ORIENTED_EDGE('',*,*,#278,.T.) ;
#354=ORIENTED_EDGE('',*,*,#347,.F.) ;
#363=ORIENTED_EDGE('',*,*,#342,.F.) ;
#364=ORIENTED_EDGE('',*,*,#247,.F.) ;
#365=ORIENTED_EDGE('',*,*,#318,.F.) ;
#366=ORIENTED_EDGE('',*,*,#285,.F.) ;
#375=ORIENTED_EDGE('',*,*,#155,.T.) ;
#376=ORIENTED_EDGE('',*,*,#297,.T.) ;
#377=ORIENTED_EDGE('',*,*,#323,.T.) ;
#378=ORIENTED_EDGE('',*,*,#181,.T.) ;
#395=ORIENTED_EDGE('',*,*,#388,.F.) ;
#396=ORIENTED_EDGE('',*,*,#393,.F.) ;
#400=ORIENTED_EDGE('',*,*,#347,.T.) ;
#401=ORIENTED_EDGE('',*,*,#271,.T.) ;
#402=ORIENTED_EDGE('',*,*,#115,.T.) ;
#403=ORIENTED_EDGE('',*,*,#84,.T.) ;
#420=ORIENTED_EDGE('',*,*,#413,.F.) ;
#421=ORIENTED_EDGE('',*,*,#418,.F.) ;
#449=ORIENTED_EDGE('',*,*,#435,.F.) ;
#450=ORIENTED_EDGE('',*,*,#413,.T.) ;
#451=ORIENTED_EDGE('',*,*,#442,.T.) ;
#452=ORIENTED_EDGE('',*,*,#447,.F.) ;
#461=ORIENTED_EDGE('',*,*,#442,.F.) ;
#462=ORIENTED_EDGE('',*,*,#418,.T.) ;
#463=ORIENTED_EDGE('',*,*,#435,.T.) ;
#464=ORIENTED_EDGE('',*,*,#459,.F.) ;
#468=ORIENTED_EDGE('',*,*,#447,.T.) ;
#469=ORIENTED_EDGE('',*,*,#459,.T.) ;
#497=ORIENTED_EDGE('',*,*,#483,.F.) ;
#498=ORIENTED_EDGE('',*,*,#388,.T.) ;
#499=ORIENTED_EDGE('',*,*,#490,.T.) ;
#500=ORIENTED_EDGE('',*,*,#495,.F.) ;
#509=ORIENTED_EDGE('',*,*,#490,.F.) ;
#510=ORIENTED_EDGE('',*,*,#393,.T.) ;
#511=ORIENTED_EDGE('',*,*,#483,.T.) ;
#512=ORIENTED_EDGE('',*,*,#507,.F.) ;
#516=ORIENTED_EDGE('',*,*,#495,.T.) ;
#517=ORIENTED_EDGE('',*,*,#507,.T.) ;
#397=FACE_BOUND('',#394,.T.) ;
#422=FACE_BOUND('',#419,.T.) ;
#51=CLOSED_SHELL('Closed Shell',(#91,#122,#162,#188,#228,#259,#308,#332,#356,#368,#398,#423,#454,#466,#471,#502,#514,#519)) ;
#59=VECTOR('Line Direction',#58,1.) ;
#68=VECTOR('Line Direction',#67,1.) ;
#75=VECTOR('Line Direction',#74,1.) ;
#82=VECTOR('Line Direction',#81,1.) ;
#99=VECTOR('Line Direction',#98,1.) ;
#108=VECTOR('Line Direction',#107,1.) ;
#113=VECTOR('Line Direction',#112,1.) ;
#130=VECTOR('Line Direction',#129,1.) ;
#139=VECTOR('Line Direction',#138,1.) ;
#146=VECTOR('Line Direction',#145,1.) ;
#153=VECTOR('Line Direction',#152,1.) ;
#165=VECTOR('Line Direction',#164,1.) ;
#174=VECTOR('Line Direction',#173,1.) ;
#179=VECTOR('Line Direction',#178,1.) ;
#196=VECTOR('Line Direction',#195,1.) ;
#203=VECTOR('Line Direction',#202,1.) ;
#210=VECTOR('Line Direction',#209,1.) ;
#215=VECTOR('Line Direction',#214,1.) ;
#236=VECTOR('Line Direction',#235,1.) ;
#243=VECTOR('Line Direction',#242,1.) ;
#250=VECTOR('Line Direction',#249,1.) ;
#267=VECTOR('Line Direction',#266,1.) ;
#274=VECTOR('Line Direction',#273,1.) ;
#281=VECTOR('Line Direction',#280,1.) ;
#288=VECTOR('Line Direction',#287,1.) ;
#295=VECTOR('Line Direction',#294,1.) ;
#316=VECTOR('Line Direction',#315,1.) ;
#321=VECTOR('Line Direction',#320,1.) ;
#340=VECTOR('Line Direction',#339,1.) ;
#345=VECTOR('Line Direction',#344,1.) ;
#431=VECTOR('Line Direction',#430,1.) ;
#438=VECTOR('Line Direction',#437,1.) ;
#479=VECTOR('Line Direction',#478,1.) ;
#486=VECTOR('Line Direction',#485,1.) ;
#521=ADVANCED_BREP_SHAPE_REPRESENTATION('NONE',(#520),#46) ;
#49=SHAPE_REPRESENTATION(' ',(#48),#46) ;
#91=ADVANCED_FACE('',(#90),#56,.F.) ;
#122=ADVANCED_FACE('',(#121),#96,.T.) ;
#162=ADVANCED_FACE('',(#161),#127,.T.) ;
#188=ADVANCED_FACE('',(#187),#56,.F.) ;
#228=ADVANCED_FACE('',(#227),#193,.T.) ;
#259=ADVANCED_FACE('',(#258),#233,.T.) ;
#308=ADVANCED_FACE('',(#307),#264,.T.) ;
#332=ADVANCED_FACE('',(#331),#313,.T.) ;
#356=ADVANCED_FACE('',(#355),#337,.T.) ;
#368=ADVANCED_FACE('',(#367),#361,.F.) ;
#398=ADVANCED_FACE('',(#379,#397),#373,.T.) ;
#423=ADVANCED_FACE('',(#404,#422),#373,.T.) ;
#454=ADVANCED_FACE('',(#453),#428,.F.) ;
#466=ADVANCED_FACE('',(#465),#428,.F.) ;
#471=ADVANCED_FACE('',(#470),#193,.T.) ;
#502=ADVANCED_FACE('',(#501),#476,.F.) ;
#514=ADVANCED_FACE('',(#513),#476,.F.) ;
#519=ADVANCED_FACE('',(#518),#193,.T.) ;
#4=APPLICATION_PROTOCOL_DEFINITION('international standard','config_control_design',1994,#1) ;
#32=APPROVAL_DATE_TIME(#13,#21) ;
#520=MANIFOLD_SOLID_BREP('PartBody',#51) ;
#11=CALENDAR_DATE(2012,9,3) ;
#30=CC_DESIGN_APPROVAL(#21,(#16,#6,#14)) ;
#18=CC_DESIGN_DATE_AND_TIME_ASSIGNMENT(#13,#17,(#16)) ;
#29=CC_DESIGN_DATE_AND_TIME_ASSIGNMENT(#13,#28,(#14)) ;
#17=DATE_TIME_ROLE('classification_date') ;
#28=DATE_TIME_ROLE('creation_date') ;
#27=CC_DESIGN_PERSON_AND_ORGANIZATION_ASSIGNMENT(#25,#26,(#16)) ;
#33=CC_DESIGN_PERSON_AND_ORGANIZATION_ASSIGNMENT(#25,#34,(#6)) ;
#35=CC_DESIGN_PERSON_AND_ORGANIZATION_ASSIGNMENT(#25,#36,(#6,#14)) ;
#37=CC_DESIGN_PERSON_AND_ORGANIZATION_ASSIGNMENT(#25,#38,(#5)) ;
#26=PERSON_AND_ORGANIZATION_ROLE('classification_officer') ;
#34=PERSON_AND_ORGANIZATION_ROLE('design_supplier') ;
#36=PERSON_AND_ORGANIZATION_ROLE('creator') ;
#38=PERSON_AND_ORGANIZATION_ROLE('design_owner') ;
#39=CC_DESIGN_SECURITY_CLASSIFICATION(#16,(#6)) ;
#383=CIRCLE('generated circle',#382,10.) ;
#392=CIRCLE('generated circle',#391,10.) ;
#408=CIRCLE('generated circle',#407,10.) ;
#417=CIRCLE('generated circle',#416,10.) ;
#446=CIRCLE('generated circle',#445,10.) ;
#458=CIRCLE('generated circle',#457,10.) ;
#494=CIRCLE('generated circle',#493,10.) ;
#506=CIRCLE('generated circle',#505,10.) ;
#522=SHAPE_REPRESENTATION_RELATIONSHIP(' ',' ',#49,#521) ;
#428=CYLINDRICAL_SURFACE('generated cylinder',#427,10.) ;
#476=CYLINDRICAL_SURFACE('generated cylinder',#475,10.) ;
#3=DESIGN_CONTEXT(' ',#1,'design') ;
#65=EDGE_CURVE('',#62,#64,#60,.T.) ;
#72=EDGE_CURVE('',#62,#71,#69,.F.) ;
#79=EDGE_CURVE('',#71,#78,#76,.T.) ;
#84=EDGE_CURVE('',#64,#78,#83,.F.) ;
#105=EDGE_CURVE('',#102,#104,#100,.T.) ;
#110=EDGE_CURVE('',#102,#62,#109,.T.) ;
#115=EDGE_CURVE('',#104,#64,#114,.T.) ;
#136=EDGE_CURVE('',#133,#135,#131,.T.) ;
#143=EDGE_CURVE('',#133,#142,#140,.T.) ;
#150=EDGE_CURVE('',#142,#149,#147,.T.) ;
#155=EDGE_CURVE('',#135,#149,#154,.T.) ;
#171=EDGE_CURVE('',#168,#170,#166,.T.) ;
#176=EDGE_CURVE('',#168,#133,#175,.F.) ;
#181=EDGE_CURVE('',#170,#135,#180,.F.) ;
#200=EDGE_CURVE('',#168,#199,#197,.T.) ;
#207=EDGE_CURVE('',#199,#206,#204,.T.) ;
#212=EDGE_CURVE('',#206,#71,#211,.T.) ;
#217=EDGE_CURVE('',#102,#142,#216,.T.) ;
#240=EDGE_CURVE('',#239,#199,#237,.T.) ;
#247=EDGE_CURVE('',#239,#246,#244,.T.) ;
#252=EDGE_CURVE('',#246,#206,#251,.T.) ;
#271=EDGE_CURVE('',#270,#104,#268,.F.) ;
#278=EDGE_CURVE('',#277,#270,#275,.T.) ;
#285=EDGE_CURVE('',#277,#284,#282,.T.) ;
#292=EDGE_CURVE('',#284,#291,#289,.T.) ;
#297=EDGE_CURVE('',#149,#291,#296,.F.) ;
#318=EDGE_CURVE('',#284,#239,#317,.T.) ;
#323=EDGE_CURVE('',#291,#170,#322,.T.) ;
#342=EDGE_CURVE('',#246,#277,#341,.T.) ;
#347=EDGE_CURVE('',#78,#270,#346,.T.) ;
#388=EDGE_CURVE('',#385,#387,#383,.T.) ;
#393=EDGE_CURVE('',#387,#385,#392,.T.) ;
#413=EDGE_CURVE('',#410,#412,#408,.T.) ;
#418=EDGE_CURVE('',#412,#410,#417,.T.) ;
#435=EDGE_CURVE('',#410,#434,#432,.F.) ;
#442=EDGE_CURVE('',#412,#441,#439,.F.) ;
#447=EDGE_CURVE('',#434,#441,#446,.T.) ;
#459=EDGE_CURVE('',#441,#434,#458,.T.) ;
#483=EDGE_CURVE('',#385,#482,#480,.F.) ;
#490=EDGE_CURVE('',#387,#489,#487,.F.) ;
#495=EDGE_CURVE('',#482,#489,#494,.T.) ;
#507=EDGE_CURVE('',#489,#482,#506,.T.) ;
#85=EDGE_LOOP('',(#86,#87,#88,#89)) ;
#116=EDGE_LOOP('',(#117,#118,#119,#120)) ;
#156=EDGE_LOOP('',(#157,#158,#159,#160)) ;
#182=EDGE_LOOP('',(#183,#184,#185,#186)) ;
#218=EDGE_LOOP('',(#219,#220,#221,#222,#223,#224,#225,#226)) ;
#253=EDGE_LOOP('',(#254,#255,#256,#257)) ;
#298=EDGE_LOOP('',(#299,#300,#301,#302,#303,#304,#305,#306)) ;
#324=EDGE_LOOP('',(#325,#326,#327,#328,#329,#330)) ;
#348=EDGE_LOOP('',(#349,#350,#351,#352,#353,#354)) ;
#362=EDGE_LOOP('',(#363,#364,#365,#366)) ;
#374=EDGE_LOOP('',(#375,#376,#377,#378)) ;
#394=EDGE_LOOP('',(#395,#396)) ;
#399=EDGE_LOOP('',(#400,#401,#402,#403)) ;
#419=EDGE_LOOP('',(#420,#421)) ;
#448=EDGE_LOOP('',(#449,#450,#451,#452)) ;
#460=EDGE_LOOP('',(#461,#462,#463,#464)) ;
#467=EDGE_LOOP('',(#468,#469)) ;
#496=EDGE_LOOP('',(#497,#498,#499,#500)) ;
#508=EDGE_LOOP('',(#509,#510,#511,#512)) ;
#515=EDGE_LOOP('',(#516,#517)) ;
#90=FACE_OUTER_BOUND('',#85,.T.) ;
#121=FACE_OUTER_BOUND('',#116,.T.) ;
#161=FACE_OUTER_BOUND('',#156,.T.) ;
#187=FACE_OUTER_BOUND('',#182,.T.) ;
#227=FACE_OUTER_BOUND('',#218,.T.) ;
#258=FACE_OUTER_BOUND('',#253,.T.) ;
#307=FACE_OUTER_BOUND('',#298,.T.) ;
#331=FACE_OUTER_BOUND('',#324,.T.) ;
#355=FACE_OUTER_BOUND('',#348,.T.) ;
#367=FACE_OUTER_BOUND('',#362,.T.) ;
#379=FACE_OUTER_BOUND('',#374,.T.) ;
#404=FACE_OUTER_BOUND('',#399,.T.) ;
#453=FACE_OUTER_BOUND('',#448,.T.) ;
#465=FACE_OUTER_BOUND('',#460,.T.) ;
#470=FACE_OUTER_BOUND('',#467,.T.) ;
#501=FACE_OUTER_BOUND('',#496,.T.) ;
#513=FACE_OUTER_BOUND('',#508,.T.) ;
#518=FACE_OUTER_BOUND('',#515,.T.) ;
#45=UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.005),#41,'distance_accuracy_value','CONFUSED CURVE UNCERTAINTY') ;
#60=LINE('Line',#57,#59) ;
#69=LINE('Line',#66,#68) ;
#76=LINE('Line',#73,#75) ;
#83=LINE('Line',#80,#82) ;
#100=LINE('Line',#97,#99) ;
#109=LINE('Line',#106,#108) ;
#114=LINE('Line',#111,#113) ;
#131=LINE('Line',#128,#130) ;
#140=LINE('Line',#137,#139) ;
#147=LINE('Line',#144,#146) ;
#154=LINE('Line',#151,#153) ;
#166=LINE('Line',#163,#165) ;
#175=LINE('Line',#172,#174) ;
#180=LINE('Line',#177,#179) ;
#197=LINE('Line',#194,#196) ;
#204=LINE('Line',#201,#203) ;
#211=LINE('Line',#208,#210) ;
#216=LINE('Line',#213,#215) ;
#237=LINE('Line',#234,#236) ;
#244=LINE('Line',#241,#243) ;
#251=LINE('Line',#248,#250) ;
#268=LINE('Line',#265,#267) ;
#275=LINE('Line',#272,#274) ;
#282=LINE('Line',#279,#281) ;
#289=LINE('Line',#286,#288) ;
#296=LINE('Line',#293,#295) ;
#317=LINE('Line',#314,#316) ;
#322=LINE('Line',#319,#321) ;
#341=LINE('Line',#338,#340) ;
#346=LINE('Line',#343,#345) ;
#432=LINE('Line',#429,#431) ;
#439=LINE('Line',#436,#438) ;
#480=LINE('Line',#477,#479) ;
#487=LINE('Line',#484,#486) ;
#2=MECHANICAL_CONTEXT(' ',#1,'mechanical') ;
#24=PERSONAL_ADDRESS(' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',(#22),' ') ;
#56=PLANE('Plane',#55) ;
#96=PLANE('Plane',#95) ;
#127=PLANE('Plane',#126) ;
#193=PLANE('Plane',#192) ;
#233=PLANE('Plane',#232) ;
#264=PLANE('Plane',#263) ;
#313=PLANE('Plane',#312) ;
#337=PLANE('Plane',#336) ;
#361=PLANE('Plane',#360) ;
#373=PLANE('Plane',#372) ;
#43=PLANE_ANGLE_MEASURE_WITH_UNIT(PLANE_ANGLE_MEASURE(0.0174532925199),#42) ;
#7=PRODUCT_CATEGORY('part',$) ;
#9=PRODUCT_CATEGORY_RELATIONSHIP(' ',' ',#7,#8) ;
#6=PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('',' ',#5,.NOT_KNOWN.) ;
#8=PRODUCT_RELATED_PRODUCT_CATEGORY('detail',$,(#5)) ;
#50=SHAPE_DEFINITION_REPRESENTATION(#40,#49) ;
#62=VERTEX_POINT('',#61) ;
#64=VERTEX_POINT('',#63) ;
#71=VERTEX_POINT('',#70) ;
#78=VERTEX_POINT('',#77) ;
#102=VERTEX_POINT('',#101) ;
#104=VERTEX_POINT('',#103) ;
#133=VERTEX_POINT('',#132) ;
#135=VERTEX_POINT('',#134) ;
#142=VERTEX_POINT('',#141) ;
#149=VERTEX_POINT('',#148) ;
#168=VERTEX_POINT('',#167) ;
#170=VERTEX_POINT('',#169) ;
#199=VERTEX_POINT('',#198) ;
#206=VERTEX_POINT('',#205) ;
#239=VERTEX_POINT('',#238) ;
#246=VERTEX_POINT('',#245) ;
#270=VERTEX_POINT('',#269) ;
#277=VERTEX_POINT('',#276) ;
#284=VERTEX_POINT('',#283) ;
#291=VERTEX_POINT('',#290) ;
#385=VERTEX_POINT('',#384) ;
#387=VERTEX_POINT('',#386) ;
#410=VERTEX_POINT('',#409) ;
#412=VERTEX_POINT('',#411) ;
#434=VERTEX_POINT('',#433) ;
#441=VERTEX_POINT('',#440) ;
#482=VERTEX_POINT('',#481) ;
#489=VERTEX_POINT('',#488) ;
#41=(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.)) ;
#42=(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.)) ;
#44=(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT()) ;
#46=(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#45))GLOBAL_UNIT_ASSIGNED_CONTEXT((#41,#42,#44))REPRESENTATION_CONTEXT(' ',' ')) ;
ENDSEC;
END-ISO-10303-21;
`




if (![].at) {
  Array.prototype.at = function(pos) { return this.slice((pos+this.length)%this.length, (pos+this.length)%this.length+1)[0] }
}


function parse_step(txt){
  function parse_atom(e){
    if (e.startsWith('.') && e.endsWith('.')){
      return e;
    }else if (e.startsWith("'") && e.endsWith("'")){
      return e.slice(1,-1);
    }else if (e.startsWith('#') || e.startsWith('$') || e.startsWith('*')){
      return e;
    }else if ('A'.charCodeAt(0) <= e.charCodeAt(0) &&  e.charCodeAt(0) <= 'Z'.charCodeAt(0)){
      return e;
    }else{
      return parseFloat(e);
    }
  }
  function parse_expr(e){
    let o = [];
    let s = "";
    let i = 0;
    while (i < e.length){
      if (e[i] == '('){
        if (s){
          o.push(parse_atom(s));
          s = "";
        }
        let lvl = 1;
        for (let j = i+1; j < e.length; j++){
          if (e[j] == '('){
            lvl++;
          }else if (e[j] == ')'){
            lvl--;
            if (lvl == 0){
              o.push(parse_expr(e.slice(i+1,j)));
              i = j;
              break;
            }
          }
        }
        
      }else if (e[i] == ','){
        if (s){
          o.push(parse_atom(s));
        }
        s = "";
      }else{
        s += e[i];
      }
      i++;
    }
    if (s) o.push(parse_atom(s));
    return o;
  }
  let lines = txt.split('\n').filter(x=>x.startsWith('#'));
  // console.log(lines);
  let entities = {};
  for (let i = 0; i < lines.length; i++){
    let l = lines[i];
    
    let [id,expr] = l.split('=');
    expr = expr.split(';')[0].trim();
    
    expr = parse_expr(expr);
    entities[id] = expr;
  }
  return entities;
}



let Step = parse_step(txt);


let W = window.innerWidth;
let H = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, W / H, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( W/2, H/2 );
document.body.appendChild( renderer.domElement );

renderer.domElement.style=`
position:absolute;
left:50%;
top:0%;
`
const controls = new THREE.OrbitControls( camera, renderer.domElement );

camera.position.set(0,0,300);
controls.update();



let PARSE = [];

PARSE.CARTESIAN_POINT=function(e){
  return e[1][1];
}

PARSE.VERTEX_POINT=function(e){
  let p = Step[e[1][1]];
  return PARSE.CARTESIAN_POINT(p);
}

PARSE.DIRECTION=function(e){
  if (!e) return [0,0,0];
  return e[1][1];
}

PARSE.VECTOR=function(e){
  let dir = PARSE.DIRECTION(Step[e[1][1]]);
  let mag = e[1][2];
  let l = Math.hypot(...dir);

  return dir.map(x=>x/l*mag);
}

function generate_edge_curve_line(p0,p1,cr){
  let [ori,dir] = cr;
  for (let i = 0; i < dir.length; i++){
    if (!dir[i]) continue;
    // if ((p0[i]-p1[i])/dir[i]>=0){
      return [p0,p1];
    // }else{
    //   return [p1,p0];
    // }
  }
}

function v_add(x0,y0,z0,x1,y1,z1){
  return [x0+x1,y0+y1,z0+z1]
}
function v_sub(x0,y0,z0,x1,y1,z1){
  return [x0-x1,y0-y1,z0-z1]
}

function v_scale(x0,y0,z0,s){
  return [x0*s,y0*s,z0*s];
}

function v_mag(x,y,z){
  return Math.sqrt(x*x+y*y+z*z)
}
function v_norm(x,y,z){
  let l = v_mag(x,y,z);
  return [x/l,y/l,z/l];
}

function v_cross(a1,a2,a3,b1,b2,b3){
  return [(a2)*(b3)-(a3)*(b2),(a3)*(b1)-(a1)*(b3),(a1)*(b2)-(a2)*(b1)]
}
function v_dot(a1,a2,a3,b1,b2,b3){
  return ((a1)*(b1)+(a2)*(b2)+(a3)*(b3));
}
function v_ang(ux,uy,uz,vx,vy,vz){
  let d = v_dot(ux,uy,uz,vx,vy,vz);
  let mu = v_mag(ux,uy,uz);
  let mv = v_mag(vx,vy,vz);
  let mumv = mu*mv;
  if (mumv == 0){
    mumv = 1;
  }
  let dmumv = d/mumv;
  if (dmumv > 1) dmumv = 1;
  if (dmumv < -1) dmumv = -1;
  return Math.acos(dmumv);
}
function v_proj(x0,y0,z0,x1,y1,z1,x2,y2,z2){
  let ap = v_sub(x0,y0,z0,x1,y1,z1);
  let ab = v_sub(x2,y2,z2,x1,y1,z1);
  return v_dot(...ap,...ab)/v_dot(...ab,...ab);
}

function m_rot_axis(ux,uy,uz,th){
  let costh = Math.cos(th);
  let sinth = Math.sin(th);
  return [
    costh+ux*ux*costh, ux*uy*(1-costh)-uz*sinth, ux*uz*(1-costh)+uy*sinth, 0,
    uy*ux*(1-costh)+uz*sinth, costh+uy*uy*(1-costh), uy*uz*(1-costh)-ux*sinth, 0,
    uz*ux*(1-costh)-uy*sinth, uz*uy*(1-costh)+ux*sinth, costh+uz*uz*(1-costh), 0,
    0,0,0,1
  ];
}

function m_tfrm(A,v){
  return [((A)[0]*(v)[0]+(A)[1]*(v)[1]+(A)[2]*(v)[2]+(A)[3])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[4]*(v)[0]+(A)[5]*(v)[1]+(A)[6]*(v)[2]+(A)[7])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15]),((A)[8]*(v)[0]+(A)[9]*(v)[1]+(A)[10]*(v)[2]+(A)[11])/((A)[12]*(v)[0]+(A)[13]*(v)[1]+(A)[14]*(v)[2]+(A)[15])];
}

let RESO = 32;




function generate_edge_curve_circle(p0,p1,cr){
  let [ax,ra] = cr;
  let [ori,dir] = ax;
  
  let v0 = v_sub(...p0,...ori);
  let v1 = v_sub(...p1,...ori);
  
  let ang = v_ang(...v0,...v1);
  let vs = [p0];
  
  for (let i = 1; i < RESO; i++){
    let a = i/RESO*ang;
    
    let m = m_rot_axis(...dir,a);
    
    
    let v = m_tfrm(m,v0);
    
    vs.push(v_add(...ori,...v));
  }
  vs.push(p1);
  
  // console.log(JSON.stringify([vs,ra,ori,dir,ang]))
  
  return vs;
}



PARSE.LINE=function(e){
  let ori = PARSE.CARTESIAN_POINT(Step[e[1][1]]);
  let dir = PARSE.VECTOR(Step[e[1][2]]);
  return [ori,dir];
}
PARSE.AXIS2_PLACEMENT_3D=function(e){
  return [PARSE.CARTESIAN_POINT(Step[e[1][1]]), PARSE.DIRECTION(Step[e[1][2]])];
}

PARSE.CIRCLE=function(e){
  // console.log(e);
  let a = PARSE.AXIS2_PLACEMENT_3D(Step[e[1][1]]);
  return [a,e[1][2]]
}

PARSE.EDGE_CURVE=function(e){
  let p0 = PARSE.VERTEX_POINT(Step[e[1][1]]);
  let p1 = PARSE.VERTEX_POINT(Step[e[1][2]]);
  let k2 = Step[e[1][3]];
  let rv = Step[e[1][4]];

  let cr;
  
  if (k2[0] == 'LINE'){
    cr = PARSE.LINE(k2);
    let r = generate_edge_curve_line(p0,p1,cr);
    return r;
    
  }else if (k2[0] == 'CIRCLE'){
    
    cr = PARSE.CIRCLE(k2);
    let r = generate_edge_curve_circle(p0,p1,cr);
    // console.log('r',r);
    return r;
  }

  return [p0,p1,cr];
}

PARSE.ORIENTED_EDGE=function(e){
  let ec = PARSE.EDGE_CURVE(Step[e[1][3]]);
  let rv = e[1][4]=='.T.';
  if (!rv){
    ec.reverse();
  }
  return ec;
}

PARSE.EDGE_LOOP=function(e){
  
  let r = e[1][1].map(x=>PARSE.ORIENTED_EDGE(Step[x]));
  return r;
}

PARSE.FACE_OUTER_BOUND=PARSE.FACE_BOUND=function(e){

  let r = PARSE.EDGE_LOOP(Step[e[1][1]]);
  let tf = e[1][2] == '.T.';

  // if (!tf){
  //   r.map(x=>x.reverse())
  //   r.reverse();
  // }
  // console.log(r);
  // for (let i = 0; i < r.length; i++){
  //   console.log(r[i].at(-1).join(','),r[(i+1)%r.length][0].join(','),r[i].at(-1).join(',')==r[(i+1)%r.length][0].join(','));
  // }
  return r;
}

PARSE.PLANE=function(e){
  let k = Step[e[1][1]];
  
  let q = PARSE.AXIS2_PLACEMENT_3D(k);
  return q;
}



PARSE.CYLINDRICAL_SURFACE=function(e){
  let k = PARSE.AXIS2_PLACEMENT_3D(Step[e[1][1]]);
  let r = e[1][2];
  return [k,r];
}


function generate_advanced_face_plane(bond,surf){
  // return [[],[],[]]
  let contours = bond.map(x=>x.map(x=>x.slice(1)).flat());

  let a = contours[0][0];
  let b = contours[0][1];
  let c = contours[0][2];

  let v0 = v_norm(...v_sub(...a,...b));
  let v1 = v_norm(...v_sub(...c,...b));

  let nm = v_cross(...v0,...v1);
  let u0 = v_cross(...nm,...v0);

  let ncs = [];
  for (let i = 0; i < contours.length; i++){
    ncs.push([])
    for (let j = 0; j < contours[i].length; j++){
      ncs.at(-1).push([
        v_proj(...contours[i][j],0,0,0,...u0), 
        v_proj(...contours[i][j],0,0,0,...v0)
      ]);
    }
  }

  let holes = [];
  let ecinp = ncs[0].slice();
  let ecin3 = contours[0].slice();
  for (let i = 1; i < contours.length; i++){
    holes.push(ecinp.length);
    ecinp.push(...ncs[i]);
    ecin3.push(...contours[i]);
  }
  let trigs = earcut(ecinp.flat(),holes,2);
  return [contours,ecin3,trigs]
}

function get_bbox(points){
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity
  for (let i = 0;i < points.length; i++){
    let [x,y] = points[i];
    xmin = Math.min(xmin,x);
    ymin = Math.min(ymin,y);
    xmax = Math.max(xmax,x);
    ymax = Math.max(ymax,y);
  }
  return {xmin,ymin,xmax,ymax};
}
function draw_svg(polylines,points){
  let {xmin,ymin,xmax,ymax} = get_bbox(polylines.flat());
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${xmin-1} ${ymin-1}, ${xmax-xmin+2} ${ymax-ymin+2}">`
  o += `<path stroke="black" stroke-width="0.02" fill="none" stroke-linecap="round" stroke-linejoin="round" d="`
  for (let i = 0; i < polylines.length; i++){
    o += '\nM ';
    for (let j = 0; j < polylines[i].length; j++){
      let [x,y] = polylines[i][j];
      o += `${(~~((x)*100)) /100} ${(~~((y)*100)) /100} `;
    }
  }
  o += `\n"/>`
  for (let i = 0; i < points.length; i++){
    
    o += `<circle cx="${points[i][0]}" cy="${points[i][1]}" r="0.05" />`
    
  }
  
  
  o += `</svg>`
  return o;
}



function generate_advanced_face_cylindrical(bond,surf){
  let contours = bond.map(x=>x.map(x=>x.slice(1)).flat());
  let [[ori,dir],rad] = surf;
  // console.log(ori,dir,rad);

  let a0 = contours[0][0];
  let t0 = v_proj(...contours[0][0],...ori,...v_add(...ori,...dir));
  let p0 = v_add(...ori,...v_scale(...dir,t0));
  
  let v0 = v_sub(...a0,...p0);
  let xscl = 10;
  
  let ncs = [];
  for (let i = 0; i < contours.length; i++){
    ncs.push([]);
    for (let j = 0; j < contours[i].length; j++){
      let a = contours[i][j];
      
      let t = v_proj(...a,...ori,...v_add(...ori,...dir));
      let p = v_add(...ori,...v_scale(...dir,t));
      let v = v_sub(...a,...p);
      
      // console.log(v_mag(...v))
      
      let th = v_ang(...v,...v0);
      // if (isNaN(th)){
      //   console.log(v,v0,th);
      // }
      ncs.at(-1).push([t,th*xscl])
    }
  }
  // console.log(JSON.stringify(ncs))
  let {xmin,ymin,xmax,ymax} = get_bbox(ncs.flat());

  
  let holes = [];
  let ecinp = ncs[0].slice();
  let ecin3 = contours[0].slice();
  
  for (let i = 1; i < contours.length; i++){
    holes.push(ecinp.length);
    ecinp.push(...ncs[i]);
    ecin3.push(...contours[i]);
  }

  // console.log(div);
  // console.log(ncs,xmin,ymin,xmax,ymax);
  

  for (let i = 0; i < 1000; i++){

    let x = xmin + (Math.random()*10000)%(xmax-xmin);
    let y = ymin + (Math.random()*10000)%(ymax-ymin);
    holes.push(ecinp.length)
    ecinp.push([x,y]);

    let m = m_rot_axis(...dir,y/xscl);
    let v = m_tfrm(m,v0);
    let q = v_add(...v_add(...ori,...v_scale(...dir,x)),...v);
    // console.log(q);
    ecin3.push(q);

    
  }
  let ecinpf = ecinp.flat();
  for (let i = 0; i < ecinp.length; i++){
    // ecinpf[i] += Math.random()*0.001 + (i%2)*0.1;
  }
  // let trigs = earcut(ecinpf,holes,2);
  let trigs = new Delaunator(ecinpf).triangles;
  
  // let div = document.createElement('div');
  // let ts = [];
  // for (let i = 0; i < trigs.length; i+=3){
  //   ts.push([ecinp[trigs[i]],ecinp[trigs[i+1]],ecinp[trigs[i+2]]]);
  // }
  // div.innerHTML = draw_svg(ts,ecinp);
  // document.body.appendChild(div);
  // console.log(ecinp,holes)
  
  
  // console.log(trigs);
  return [contours,ecin3,trigs]
  

}


PARSE.ADVANCED_FACE=function(e){
  let bond = e[1][1].map(x=>PARSE.FACE_OUTER_BOUND(Step[x]));
  let s = Step[e[1][2]];
  let surf;
  if (s[0] == 'PLANE'){
    surf = PARSE.PLANE(s);
    return generate_advanced_face_plane(bond,surf);
  }else if (s[0] == 'CYLINDRICAL_SURFACE'){
    surf = PARSE.CYLINDRICAL_SURFACE(s);
    return generate_advanced_face_cylindrical(bond,surf);
  }
  // console.log(surf,bond);
  // return bond;
  return '?'
  
}

PARSE.CLOSED_SHELL=function(e){
  let contours = [];
  let points = [];
  let trigs = [];
  for (let i = 0; i < e[1][1].length; i++){
    let [c,p,t] = PARSE.ADVANCED_FACE(Step[e[1][1][i]]);
    t.map(x=>trigs.push(x+points.length));
    c.map(x=>contours.push(x));
    p.map(x=>points.push(x));
    
  }
  return [contours,points,trigs];
}


let root = new THREE.Object3D();
scene.add(root);





function animate(){
  requestAnimationFrame(animate);

  controls.update();
  renderer.render( scene, camera );
}
animate();



function rgba(r, g, b, a) {

  r = r != undefined ? r : 255;
  g = g != undefined ? g : r;
  b = b != undefined ? b : g;
  a = a != undefined ? a : 1.0;

  return (
    "rgba(" +
    Math.floor(r) +
    "," +
    Math.floor(g) +
    "," +
    Math.floor(b) +
    "," +
    a.toFixed(3) +
    ")"
  );
}

function hsv(h, s, v, a) {
  var c = v * s;
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  var m = v - c;
  var [rv, gv, bv] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(h / 60)];
  return [(rv + m) * 255, (gv + m) * 255, (bv + m) * 255];
  
}

function command_color(x){
  if (!DRAW[x]){
    return [128,128,128];
  }
  let jsr = 0;
  function rand() {
    jsr ^= jsr << 17;
    jsr ^= jsr >> 13;
    jsr ^= jsr << 5;
    return (jsr >>> 0) / 4294967295;
  }

  for (let i = 0; i < x.length; i++){
    jsr = (jsr << 7) | x.charCodeAt(i);
    rand();
  }
  let h = rand();
  return hsv(h*180,0.4,0.9);
}


let DRAW = [];

DRAW.CARTESIAN_POINT = DRAW.VERTEX_POINT = function(es){
  let pointsList = [];
  for (let e of es){
    pointsList.push(new THREE.Vector3(...e));
    
  }
  var dotGeometry = new THREE.BufferGeometry();
  const verticesArray = new Float32Array(pointsList.length * 3);
  pointsList.forEach((point, index) => {
      point.toArray(verticesArray, index * 3);
  });
  dotGeometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

  var dotMaterial = new THREE.PointsMaterial( { size: 8, sizeAttenuation: false } );
  var dot = new THREE.Points( dotGeometry, dotMaterial );
  root.add( dot );
}



DRAW.EDGE_CURVE = DRAW.ORIENTED_EDGE = function(es){
  let linesList = [];
  for (let e of es){
    for (let i = 0; i < e.length-1; i++){
      linesList.push([
        new THREE.Vector3(...e[i]),
        new THREE.Vector3(...e[i+1]),
      ])
    }
  }
  
  const lineGeometry = new THREE.BufferGeometry();
  const verticesArray = new Float32Array(linesList.length * 6); // 2 vertices per line segment, 3 coordinates per vertex
  linesList.forEach((line, index) => {
      line[0].toArray(verticesArray, index * 6);
      line[1].toArray(verticesArray, index * 6 + 3);
  });

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

  root.add(lines);
}



DRAW.EDGE_LOOP = DRAW.FACE_BOUND = DRAW.FACE_OUTER_BOUND = function(es){
  let linesList = [];
  for (let e of es){
    for (let i = 0; i < e.length; i++){
      for (let j = 0; j < e[i].length-1; j++){
        linesList.push([
          new THREE.Vector3(...e[i][j]),
          new THREE.Vector3(...e[i][j+1]),
        ])
      }
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  const verticesArray = new Float32Array(linesList.length * 6); // 2 vertices per line segment, 3 coordinates per vertex
  linesList.forEach((line, index) => {
      line[0].toArray(verticesArray, index * 6);
      line[1].toArray(verticesArray, index * 6 + 3);
  });

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

  root.add(lines);
  
}


DRAW.CLOSED_SHELL = DRAW.ADVANCED_FACE = function(es){
  var geometry = new THREE.BufferGeometry();
  var vertices = [];
  
  for (let e of es){
    let [contours,points,trigs] = e;

    for (let i = 0; i < trigs.length; i+=3){
      vertices.push(...points[trigs[i]],...points[trigs[i+1]],...points[trigs[i+2]]);
    }

  }
  vertices = new Float32Array(vertices);

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  geometry.computeVertexNormals();

  var material = new THREE.MeshNormalMaterial({ side:THREE.DoubleSide }); // Change color as needed

  var mesh = new THREE.Mesh(geometry, material);
  root.add(mesh);
}


DRAW.LINE = DRAW.AXIS2_PLACEMENT_3D = DRAW.PLANE = function(es){
  let linesList = [];
  let pointsList = [];
  
  for (let e of es){
    let [ori,dir] = e;
    linesList.push([
      new THREE.Vector3(...ori),
      new THREE.Vector3(...dir).multiplyScalar(10).add(new THREE.Vector3(...ori)),
    ]);
    pointsList.push(new THREE.Vector3(...ori));
  }
  {
    var dotGeometry = new THREE.BufferGeometry();
    const verticesArray = new Float32Array(pointsList.length * 3);
    pointsList.forEach((point, index) => {
        point.toArray(verticesArray, index * 3);
    });
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

    var dotMaterial = new THREE.PointsMaterial( { size: 8, sizeAttenuation: false } );
    var dot = new THREE.Points( dotGeometry, dotMaterial );
    root.add( dot );
  }{
    const lineGeometry = new THREE.BufferGeometry();
    const verticesArray = new Float32Array(linesList.length * 6); // 2 vertices per line segment, 3 coordinates per vertex
    linesList.forEach((line, index) => {
        line[0].toArray(verticesArray, index * 6);
        line[1].toArray(verticesArray, index * 6 + 3);
    });

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    root.add(lines);
  }
}

DRAW.CIRCLE = function(es){
  let linesList = [];
  
  for (let e of es){
    let [ax,ra] = e;
    let [ori,dir] = ax;

    let r = v_norm(Math.random(),Math.random(),Math.random())
    
    let v0 = v_norm(...v_cross(...dir,...r));
    let vs = [];
    for (let i = 0; i < RESO; i++){
      let a = i/(RESO-1)*Math.PI*2;

      let m = m_rot_axis(...dir,a);

      let v = v_scale(...m_tfrm(m,v0),ra);

      vs.push(v_add(...ori,...v));
    }
    for (let i = 0; i < vs.length-1; i++){
      linesList.push([
        new THREE.Vector3(...vs[i]),
        new THREE.Vector3(...vs[i+1]),
      ])
    }
    
    
  }
  const lineGeometry = new THREE.BufferGeometry();
  const verticesArray = new Float32Array(linesList.length * 6); // 2 vertices per line segment, 3 coordinates per vertex
  linesList.forEach((line, index) => {
      line[0].toArray(verticesArray, index * 6);
      line[1].toArray(verticesArray, index * 6 + 3);
  });

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

  root.add(lines);
}

function recheck(q,c){

  let id = 'chq_'+q.slice(1);
  let chq = document.getElementById(id);

  // console.log(chk)
  for (let k in Step){
    if (Step[k][0] != Step[q][0]) continue;
    let jd = 'chk_'+k.slice(1);
    let chk = document.getElementById(jd);
    if (!chk) continue;
    chk.checked = c;
  }
  for (let k in Step){
    if (Step[k][0] != Step[q][0]) continue;
    let jd = 'chq_'+k.slice(1);
    let chk = document.getElementById(jd);
    if (!chk) continue;
    chk.checked = c;
  }

      
    
  
}


function redraw(){
  for( var i = root.children.length - 1; i >= 0; i--) { 
     let obj = root.children[i];
     root.remove(obj); 
  }
  let todo = {};
  for (let k in Step){
    let id = 'chk_'+k.slice(1);
    let jd = 'chq_'+k.slice(1);
    let chk = document.getElementById(id);
    if (!chk) continue;
    // console.log(chk)
    document.getElementById(jd).checked = chk.checked;
    if (chk.checked){
      let cmd = Step[k][0];
      if (!DRAW[cmd]) continue;
      
      if (!todo[cmd]){
        todo[cmd] = [];
      }

      todo[cmd].push(PARSE[cmd](Step[k]))
    }
  }
  for (let k in todo){
    // console.log(k,todo[k])
    DRAW[k](todo[k]);
  }
  // DRAW[e[0]](PARSE[e[0]](e));
}


function make_highlight(){
  
  function render_param(e){
    if (Array.isArray(e)){
      return '('+e.map(render_param).join(',')+')'
    }else if (typeof e == 'string'){
      if (e[0] == '#'){
        return `<a href="#anc_${e.slice(1)}" style="background:${rgba(...command_color(Step[e][0]),0.5)}">${e}</a>`
      }else if (['*','$','.'].includes(e[0])){
        return `<span style="color:gray">${e}</span>`
      }else{
        return `<span style="color:gray">'${e}'</span>`
      }
    }else if (typeof e == 'number'){
      return `<span style="color:green">${e}</span>`
    }else{
      console.log(e);
    }
  }
  
  function render_line(e){
    let o = `<span style="background:${rgba(...command_color(e[0]),0.5)}">${e[0]}</span>`;
    o += render_param(e[1])+';';
    return o;
  }
  let div = document.createElement('div');
  
  div.style=`background:floralwhite;position:absolute;left:0px;top:0px;overflow:scroll;width:50%;height:50%;font-family:monospace;white-space:nowrap`;
  
  let hd = txt.split('#')[0];
  let hdd = document.createElement('div');
  hdd.style.marginLeft="35px";
  hdd.innerHTML = hd.split('\n').join('<br>');
  div.appendChild(hdd);

  
  for (let k in Step){
    if (typeof Step[k][0] != 'string'){
      continue;
    }
    let dl = document.createElement('div');
    dl.id = `anc_`+k.slice(1);
    dl.innerHTML = `<input id="chq_${k.slice(1)}" onchange="recheck('${k}',this.checked);redraw()" type="checkbox" style="margin-right:-2px" ${Step[k][0]=='CLOSED_SHELL'?'checked':''}/><input id="chk_${k.slice(1)}" onchange="redraw()" type="checkbox" ${Step[k][0]=='CLOSED_SHELL'?'checked':''}/><span>${k}</span>=`+render_line(Step[k]);
    dl.classList.add('hover');
    dl.style="white-space:nowrap;margin-top:-2px;margin-bottom:-3px;"
    // dl.onclick = function(){
    //   draw_one(k);
    // }
    div.appendChild(dl);
  }
  
  let ft = txt.split('#').at(-1).split(';').slice(1).join(';').split('\n').slice(1).join('\n');
  let ftd = document.createElement('div');
  ftd.innerHTML = ft.split('\n').join('<br>');
  ftd.style.marginLeft="35px";
  div.appendChild(ftd);
  
  document.body.appendChild(div);
  
}

make_highlight();

redraw();














function make_graph(){
  function find_edges(e){
    let es = [];
    if (Array.isArray(e)){
      return e.map(find_edges).flat();
    }else if (typeof e == 'string'){
      if (e[0] == '#'){
        es.push(e);
      }
    }
    return es;
  }
  let graph = {
    nodes:[],
    edges:[],
  }
  
  let lvlmap = {
    
  }
  let lvlmax = 0;
  function make_one(k){
    if (lvlmap[k]) return;
    let e = Step[k];
    let zs = find_edges(e);
    let lvl = 0;
    for (let i = 0; i < zs.length; i++){
      if (!lvlmap[zs[i]]){
        make_one(zs[i]);
      }
      lvl = Math.max(lvl,lvlmap[zs[i]]+1);
    }
    lvlmap[k] = lvl;
    lvlmax = Math.max(lvl,lvlmax);
  }
  for (let k in Step){
    make_one(k);
  }
  let gn = {};
  let nl = Object.keys(Step).length;
  
  for (let k in Step){
    let e = Step[k];
    // if (typeof e[0] !== 'string')continue;
    let zs = find_edges(e);
    let n = {id:k,lvl:lvlmap[k],lvlmax,x:Number(k.slice(1))/nl*window.innerWidth,y:(lvlmap[k]+1)/lvlmax*window.innerHeight/2};
    graph.nodes.push(n);
    gn[k] = n;
    for (let z of zs){
      let kz = `${k},${z}`
      graph.edges.push({id:kz,source:k,target:z})
    }
  }
  // console.log(lvlmap);
  // for (let i = 0; i < graph.edges.length; i++){
  //   graph.edges[i].source = gn[graph.edges[i].source];
  //   graph.edges[i].target = gn[graph.edges[i].target];
  // }
  // console.log(graph)
  return graph;
}

let GN;
function make_graph2(){
  let W = window.innerWidth;
  let H = window.innerHeight/2;
  function find_edges(e){
    let es = [];
    if (Array.isArray(e)){
      return e.map(find_edges).flat();
    }else if (typeof e == 'string'){
      if (e[0] == '#'){
        es.push(e);
      }
    }
    return es;
  }
  let graph = {
    nodes:[],
    edges:[],
  }
  
  let lvlmap = {
    
  }
  let lvlmax = 0;
  function make_one(k){
    if (lvlmap[k]) return;
    let e = Step[k];
    let zs = find_edges(e);
    let lvl = 0;
    for (let i = 0; i < zs.length; i++){
      if (!lvlmap[zs[i]]){
        make_one(zs[i]);
      }
      lvl = Math.max(lvl,lvlmap[zs[i]]+1);
    }
    lvlmap[k] = lvl;
    lvlmax = Math.max(lvl,lvlmax);
  }
  for (let k in Step){
    make_one(k);
  }
  let lvls = new Array(lvlmax+1).fill(0).map(x=>[]);
  let nl = Object.keys(Step).length;
  let gn = {};
  for (let k in Step){
    let e = Step[k];
    // if (typeof e[0] !== 'string')continue;
    let zs = find_edges(e);
    let n = {id:k,lvl:lvlmap[k],lvlmax,req:zs,giv:[],y:(lvlmap[k])/lvlmax*(H*0.8)+H*0.1};
    n.y0 = n.y;
    graph.nodes.push(n);
    gn[k] = n;
    
    
    for (let z of zs){
      let kz = `${k},${z}`
      graph.edges.push({id:kz,source:k,target:z})
    }
  }
  for (let k in gn){
    for (let z of gn[k].req){
      gn[z].giv.push(k);
    }
  }
  for (let k in gn){
    if (gn[k].giv.length == 0){
      gn[k].lvl = lvlmax;
    }
    lvls[lvlmap[k]].push(gn[k]);
  }
  
  // for (let t = 0; t < 10; t++){
    for (let i = lvlmax; i >=0; i--){
      for (let j = 0; j < lvls[i].length; j++){
        let n = lvls[i][j];
        if (n.lvl == lvlmax){
          n.x = j/lvls[i].length*(W*0.8)+W*0.1;
        }else{
          let sx = 0;
          for (let k = 0; k < n.giv.length; k++){
            // console.log(gn[n.giv[k]])
            sx += gn[n.giv[k]].x
          }
          // console.log(n,sx,n.giv.length)
          sx /= n.giv.length;
          sx += Number(n.id.slice(1))/1000;
          n.x = sx;
          if (isNaN(n.x)){
            throw 'up'
          }
        }
        // console.log(n.x);
      }
    }
    for (let i = 0; i < lvls.length; i++){
      lvls[i].sort((a,b)=>(a.x-b.x));
      for (let j = 0; j < lvls[i].length; j++){
        let n = lvls[i][j];
        n.x = j/lvls[i].length*(W*0.8)+W*0.1;
      }
    }
    for (let i = 1; i < lvls.length; i++){
      for (let j = 0; j < lvls[i].length; j++){
        let sx = 0;
        let n = lvls[i][j];
        for (let k = 0; k < n.req.length; k++){
          sx += gn[n.req[k]].x;
        }
        sx /= n.req.length;
        n.x = sx;
        // n.x = Math.random()*window.innerWidth;
      }
    }
  // }
  GN = gn;
  return graph;
}

// make_graph2()

visualizeGraph(make_graph2());



function visualizeGraph(graph) {
  function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  
  graph = copy(graph);


  // Create the SVG container
  const svg = d3.select('body').append('svg')
      .attr('width', '100%')
      .attr('height', '50%')
      .style('position','absolute')
      .style('left','0%')
      .style('top','50%')

  // Set up the simulation with forces
  const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.edges).id(d => d.id).distance(50).strength(0.00002))
      .force('collision', d3.forceCollide().radius(d=>d.lvl+6))
      .force('y', d3.forceY(d=>d.y0).strength(0.1))
      // .force('boundingBox',boundingBoxForce(0, 0, window.innerWidth, window.innerHeight/2,-2))
      // .force('charge', d3.forceManyBody().strength(-1))
      // .force('x', d3.forceX(window.innerWidth/4).strength(0.1))
      // .force('y', d3.forceY(window.innerHeight/4).strength(0.1));

  // Create the links (lines)
  const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.edges)
      .enter().append('line')
      .attr('stroke-width', 0.8)
      .attr('stroke', 'black');

  // Create the nodes (circles)
  const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graph.nodes)
      .enter().append('circle')
      .attr('r', x=>x.lvl+4)
      .attr('fill', x=>rgba(...command_color(Step[x.id][0])))
      .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

  // Add labels to each node
  const labels = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(graph.nodes)
      .enter().append('text')
      .text(d => d.id)
      .style('pointer-events','none')
      .style('user-select','none')
      .style('font-family','monospace')
      .style('font-size','6px')
// console.log(link)
  // Update positions each tick
  simulation.on('tick', () => {
      link.attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
    
      // link.attr('x1', d => GN[d.source].x)
      //     .attr('y1', d => GN[d.source].y)
      //     .attr('x2', d => GN[d.target].x)
      //     .attr('y2', d => GN[d.target].y);

      node.attr('cx', d => d.x)
          .attr('cy', d => d.y);
          

      labels.attr('x', d => d.x)
    .attr('text-anchor','middle')
    .attr('dominant-baseline','middle')
          .attr('y', d => d.y);
  });

  
  let root2 = new THREE.Object3D();
  
  function temp_draw(sg){
    for( var i = root.children.length - 1; i >= 0; i--) { 
      let obj = root.children[i];
      root2.add(obj);
      root.remove(obj); 
    }
    let todo = {};
    for (let k in sg){

      let cmd = Step[k][0];
      if (!DRAW[cmd]) continue;

      if (!todo[cmd]){
        todo[cmd] = [];
      }

      todo[cmd].push(PARSE[cmd](Step[k]))
    }
    for (let k in todo){
      DRAW[k](todo[k]);
    }
  }
  
  
  function subg(k){
    let o = {[k]:1};
 
    for (let i = 0; i < graph.edges.length; i++){
      let [a,b] = graph.edges[i].id.split(',')
      if (a == k){
        o[b] = 1;
        Object.assign(o,subg(b));
      }
    }
    return o;
  }
  
  function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
    
      
      d.fy = d.y;
    
    let sg = subg(d.id);
    
    node.attr('fill-opacity',d=>(sg[d.id]?1:0.2))
    link.attr('stroke-opacity',d=>((sg[d.source.id])?1:0.2))
    
    if (Object.keys(sg).length < 100){
      labels.text(d=>(sg[d.id]?(Step[d.id][0]+d.id):d.id))
      labels.style('font-size',d=>sg[d.id]?'8px':'0px')
    }
    
    temp_draw(sg);
    
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;

  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    node.attr('fill-opacity',1)
    link.attr('stroke-opacity',1)
    
    labels.text(d=>d.id);
    labels.style('font-size','6px')
    
    for( var i = root.children.length - 1; i >= 0; i--) { 
      let obj = root.children[i];
      root.remove(obj); 
    }
    
    for( var i = root2.children.length - 1; i >= 0; i--) { 
      let obj = root2.children[i];
      root.add(obj); 
    }
    
  }
}
