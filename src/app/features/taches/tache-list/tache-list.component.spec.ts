import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacheListComponent } from './tache-list.component';

describe('TacheListComponent', () => {
  let component: TacheListComponent;
  let fixture: ComponentFixture<TacheListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TacheListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TacheListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
